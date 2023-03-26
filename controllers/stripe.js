const { Userdb } = require("../models/userdb");
const { checkActiveSubscription, hasTrialPeriod, getCustomerSubscription, getCustomerPaymentMethod } = require("../utils/stripeUtils");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

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
        console.log('active')
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
      subscription_data: {
        trial_period_days: 3, // optional trial period
      },
      success_url: `http://127.0.0.1:5173/dashboard/payments`,
      cancel_url: "http://127.0.0.1:5173/dashboard/payments",
    });


    console.log(session.payment_method,'payment method')
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      payment_method: session.payment_method,
      invoice_settings: {
        default_payment_method: session.payment_method,
      },
    });
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        trial_period_days: 3,
      });
      
      const subscriptionId = subscription.id;

    // Update the database with the customer and session IDs
    console.log({
        customerId: customer.id,
        sessionId: session.id,
        subscriptionId: subscription.id,
        paymentIntentId: session.payment_intent?.id,
      })
    await Userdb.findByIdAndUpdate(userId, {
      customerId: customer.id,
      sessionId: session.id,
      subscriptionId: subscription.id,
      paymentIntentId: session?.payment_intent?.id,
    });
    console.log('added')


    // Associate the new customer with the Checkout session
    // await stripe.checkout.sessions.update(session.id, {
    //   customer: customer.id,
    // });

    // Display the payment details on the confirmation page
    const amount = session.amount_total / 100;
    const currency = session.currency.toUpperCase();
    res
      .status(200)
      .json({
        msg: `Payment confirmed: ${amount} ${currency}`,
        url: session.url,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "An error occurred", err });
  }
};

// Endpoint to retrieve payment details and update the database
const checkPaymentStatus = async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // Check the payment status
    if (session.payment_status === "paid") {
      // Update the database with the payment details
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const paymentIntentId = session.payment_intent.id;
      // ...update database with payment details...

      // Display the payment details on the confirmation page
      const amount = session.amount_total / 100;
      const currency = session.currency.toUpperCase();
      res.status(200).json({ msg: `Payment confirmed: ${amount} ${currency}` });
    } else {
      // Handle other payment status (e.g. unpaid, canceled)
      res.json({ msg: "you are not a paid user" });
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
  const {userId} = req.params;
  console.log(userId)

try {
    const user = await Userdb.findById(userId);
    const customerId = user.customerId;
    const hasTrial = await hasTrialPeriod(user.subscriptionId)

    if (hasTrial.status) {
      res.status(200).json({msg:'on trial',data:hasTrial})
    } else {
        const hasActiveSub = await checkActiveSubscription(customerId)
        if (hasActiveSub) {
          const getPlan = await getCustomerSubscription(customerId)
          res.status(200).json({msg:'plan retrieved',plan:getPlan})
        } else {
          res.status(301).json({msg:'no active plan'})
        }
    }
  

} catch (error) {
    res.status(500).json({msg:'something went wrong',error})
    
}

}
async function getPaymentMethod(req, res) {
    const {userId} = req.params;
    console.log(userId)
  
  try {
      const user = await Userdb.findById(userId);
      const customerId = user.customerId;
      const paymentMethod = await getCustomerPaymentMethod(customerId)
      console.log(paymentMethod)
      if (paymentMethod) {
        res.status(200).json({msg:'payment methods found',data:paymentMethod})
      } else {
        res.status(400).json({msg:'no payment method',data:paymentMethod})
      }
    
  
  } catch (error) {
      res.status(500).json({msg:'something went wrong',error})
      
  }
  
  }

module.exports = {getPaymentMethod, checkPaymentStatus,checkUserPlan, createCheckout, cancelSubscription };
