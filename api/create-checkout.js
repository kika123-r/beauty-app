const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const PLANS = {
    starter:  { name: 'Starter',  price: 490  },
    pro:      { name: 'Pro',      price: 990  },
    business: { name: 'Business', price: 1990 },
  };

  const { plan, salonId, email } = req.body;
  const planConfig = PLANS[plan];

  if (!planConfig) return res.status(400).json({ error: 'Invalid plan' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Missing Stripe key' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `BeautyTime ${planConfig.name}`,
            description: `Mesačné predplatné BeautyTime ${planConfig.name}`,
          },
          unit_amount: planConfig.price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: email || undefined,
      success_url: `https://beauty-app-lac.vercel.app/admin/pricing?success=true&plan=${plan}&salonId=${salonId}`,
      cancel_url: `https://beauty-app-lac.vercel.app/admin/pricing?cancelled=true`,
      metadata: { salonId: salonId || '', plan },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
