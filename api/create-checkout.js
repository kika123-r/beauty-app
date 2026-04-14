const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter:  { name: 'Starter',  price: 490,  interval: 'month' },
  pro:      { name: 'Pro',      price: 990,  interval: 'month' },
  business: { name: 'Business', price: 1990, interval: 'month' },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, salonId, email } = req.body;
  const planConfig = PLANS[plan];

  if (!planConfig) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `BeautyTime ${planConfig.name}`,
            description: `Mesačné predplatné — BeautyTime ${planConfig.name}`,
          },
          unit_amount: planConfig.price,
          recurring: { interval: planConfig.interval },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: email,
      success_url: `${req.headers.origin}/admin/pricing?success=true&plan=${plan}&salonId=${salonId}`,
      cancel_url: `${req.headers.origin}/admin/pricing?cancelled=true`,
      metadata: { salonId, plan },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
