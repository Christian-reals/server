const CheckoutSession = require("../models/checoutSessions");
const { Userdb } = require("../models/userdb");
const {
  checkActiveSubscription,
  hasTrialPeriod,
  getCustomerSubscription,
  getCustomerPaymentMethod,
} = require("../utils/stripeUtils");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const remoteUrl = process.env.REMOTE_USER_URL;
const baseUrl = process.env.BASE_USER_URL;

// Endpoint to create a new Checkout Session
const createCheckout = async (req, res) => {
  const { email, priceId, userId } = req.body;

  try {
    // Check if the user has an active subscription
    const user = await Userdb.findById(userId);

    if (user?.subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user?.subscriptionId
      );
      if (subscription.status === "active") {
        console.log("active");
        return res
          .status(400)
          .json({ msg: "User already has an active subscription" });
      }
    }

    // Create a new Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {},
      success_url: `${remoteUrl}/sucess`,
      cancel_url: `${remoteUrl}/dashboard/payments`,
    });

    const checkout = await CheckoutSession.create({
      sessionId: session?.id,
      email,
      userId,
      priceId,
    });
    await checkout.save();
    res.status(200).json({ msg: "Success", url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "An error occurred", err });
  }
};

// Endpoint to retrieve payment details and update the database
const checkPaymentStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Userdb.findById(userId);
    const { sessionId, customerId } = user;
    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // Check the payment status
    if (session.payment_status === "paid") {
      console.log(session);

      const paymentMethodId = session?.payment_intent?.payment_method;
      //add payment details to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers?.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Display the payment details on the confirmation page
      const amount = session.amount_total / 100;
      const currency = session.currency.toUpperCase();
      res.status(200).json({ msg: `Payment confirmed: ${amount} ${currency}` });
    } else if (session.payment_status === "unpaid") {
      // Handle other payment status (e.g. unpaid, canceled)
      res
        .status(201)
        .json({ msg: "Your payment is incomplete", status: "unpaid" });
    } else if (session.payment_status === "canceled") {
      // Handle other payment status (e.g. unpaid, canceled)
      res
        .status(201)
        .json({ msg: "Your payment has been canceled", status: "canceled" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};

// Endpoint to handle refunds or cancellations
const cancelSubscription = async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.del(subscriptionId);

    // Refund any un-used portion of the subscription (if applicable)
    const latestInvoice = canceledSubscription.latest_invoice;
    if (latestInvoice.payment_intent.status === "succeeded") {
      const refund = await stripe.refunds.create({
        payment_intent: latestInvoice.payment_intent,
      });
      console.log("Refund: ", refund);
    }

    // Update the database with the canceled subscription details
    // ...update database with canceled subscription details...

    res.json({ message: "Subscription canceled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};

//check user subscription
async function checkUserPlan(req, res) {
  const { userId } = req.params;

  try {
    const user = await Userdb.findById(userId);
    console.log(user);

    if (user.hasTrial && Number(Date.now() - user?.trialEndDate) <= 3) {
      return res.status(200).json({
        msg: "User has trial",
        trial: user.trialEndDate,
        planName: "Trial",
      });
    } else if (user.isPremium) {
      const { currentPlan, currentPeriodEnd } = await getCustomerSubscription(
        user.customerId,
        user.subscriptionId
      );
      return res.status(200).json({
        msg: "User has a valid plan",
        trial: null,
        planId: currentPlan,
        planName: "Premium",
        currentPeriodEnd,
      });
    } else {
      return res.status(200).json({
        msg: "User is on Basic plan",
        trial: null,
        planName: "Basic",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "something went wrong", error });
  }
}
async function getPaymentMethod(req, res) {
  const { userId } = req.params;

  try {
    const user = await Userdb.findById(userId);
    const customerId = user.customerId;
    const paymentMethod = await getCustomerPaymentMethod(customerId);
    console.log(paymentMethod);
    if (paymentMethod) {
      res
        .status(200)
        .json({ msg: "payment methods found", data: paymentMethod });
    } else {
      res.status(400).json({ msg: "no payment method", data: paymentMethod });
    }
  } catch (error) {
    res.status(500).json({ msg: "something went wrong", error });
  }
}
async function stripeWebhook(req, res) {
  let data;
  let eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      const signature = req.headers["stripe-signature"];
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET ||
          "whsec_21e18e906fb690b0aa3e2ecaa9a18d63530d8b45e5e060af641ae5a20a99b766"
      );
      data = event.data;
      eventType = event.type;
    } catch (err) {
      console.log("⚠️  Webhook signature verification failed.");
      return res.sendStatus(400);
    }
  } else {
    data = req.body.data;
    eventType = req.body.type;
  }

  console.log(data, eventType);


  if (eventType === "checkout.session.completed") {
    console.log(data, eventType);

    try {
      const checkout = await CheckoutSession.findOne({
        sessionId: data.object.id,
      });
      console.log(checkout, "checkout");
      const { email, priceId, sessionId, userId } = checkout;
      const session = data.object;

      console.log("🔔  Payment received!");
      const customer = await stripe.customers?.create({
        email: email,
        payment_method: session.payment_method,
        invoice_settings: {
          default_payment_method: session.payment_method,
        },
      });
      console.log(customer.id, "customer");

      console.log(priceId);
      const subscription = await stripe.subscriptions.create({
        customer: customer?.id,
        items: [{ price: priceId }],
        trial_period_days: 3,
      });

      const { id: subscriptionId } = subscription;

      await Userdb.findByIdAndUpdate(userId, {
        customerId: customer?.id,
        sessionId: session.id,
        subscriptionId: subscriptionId,
        paymentIntentId: session?.payment_intent?.id,
        isPremium: true,
      });

      console.log("Added to the database.");

      // Uncomment the following lines if you want to associate the new customer with the Checkout session
      await stripe.checkout.sessions.update(session.id, {
        customer: customer?.id,
      });

      const amount = session.amount_total / 100;
      const currency = session.currency.toUpperCase();

      res.status(200).json({
        msg: `Payment confirmed: ${amount} ${currency}`,
      });
    } catch (error) {
      console.error("Error processing checkout session:", error);
      return res.sendStatus(500);
    }
  }
  else if(eventType === 'customer.subscription.trial_will_end'){
    console.log("3 days more",data);

  }
  else if(eventType ==='customer.subscription.deleted'){
    console.log("deleted",data);

  }
}

async function customerPortal(req, res) {
  try {
  } catch (error) {}
  const { userId } = req.params;
  const user = await Userdb.findById(userId);

  if (user) {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.CUSTOMER_PORTAL_RETURN_URL;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: returnUrl,
    });

    res.status(200).json({ url: portalSession.url, msg: "request sucessful" });
  } else {
  }
}
module.exports = {
  getPaymentMethod,
  checkPaymentStatus,
  checkUserPlan,
  createCheckout,
  cancelSubscription,
  customerPortal,
  stripeWebhook,
};
