
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

// Create a customer with their payment method
const createCustomerWithPaymentMethod = async (email, paymentMethodId) => {
  const customer = await stripe.customers.create({
    email: email,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Subscribe the customer to a plan
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: "price_123", quantity: 1 }],
    expand: ["latest_invoice.payment_intent"],
  });

  return { customer, subscription };
};

// Retrieve a customer's payment method
const getCustomerPaymentMethod = async (customerId) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return paymentMethods.data[0];
};

// Add a new payment method to a customer
const addCustomerPaymentMethod = async (customerId, paymentMethodId) => {
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
};

// Remove a payment method from a customer
const removeCustomerPaymentMethod = async (customerId, paymentMethodId) => {
  await stripe.paymentMethods.detach(paymentMethodId);

  const customer = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: null,
    },
  });

  return customer;
};

async function hasTrialPeriod(subscriptionId) {
  console.log(subscriptionId,'sub')
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.trial_end !== null) {
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const today = new Date();
    const timeLeftInTrial = currentPeriodEnd.getTime() - today.getTime();

    const daysLeftInTrial = Math.ceil(timeLeftInTrial / (1000 * 60 * 60 * 24));

    return {status:true,daysRemaining:daysLeftInTrial};
  }
  else{
    return {status:false,daysRemaining:0}
  }
}

async function getCustomerSubscription(customerId) {
  console.log(customerId,'customer')
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const subscription = await stripe.subscriptions.retrieve(customer.subscriptions.data[0].id);
    const currentPlan = subscription.plan.id;
    const currentPeriodEnd = subscription.current_period_end;
    return { currentPlan, currentPeriodEnd };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function checkActiveSubscription(customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['subscriptions'],
    });

    const activeSubscriptions = customer.subscriptions.data.filter(subscription => subscription.status === 'active');

    return activeSubscriptions.length > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  createCustomerWithPaymentMethod,
  getCustomerPaymentMethod,
  addCustomerPaymentMethod,
  removeCustomerPaymentMethod,
  hasTrialPeriod,
  getCustomerSubscription,
  checkActiveSubscription
};
