const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const templates = {
  booking_confirmed: (data) => ({
    subject: `Rezervácia potvrdená — ${data.serviceName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F5F0EA; padding: 40px 20px;">
        <div style="background: #1C1C1B; borderRadius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #D4C5B0; font-weight: 400; margin: 0 0 8px;">BeautyTime</h1>
          <p style="font-size: 12px; color: #6A5D52; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">Rezervačný systém</p>
        </div>
        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px; margin-bottom: 16px;">
          <p style="font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #979086; margin: 0 0 12px;">Potvrdenie rezervácie</p>
          <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1C1C1B; font-weight: 400; margin: 0 0 24px;">Vaša rezervácia je potvrdená</h2>
          <div style="background: #F5F0EA; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em;">Salón</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right;">${data.salonName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Služba</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Dátum</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Čas</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.time}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Cena</td><td style="padding: 8px 0; font-size: 14px; color: #6A5D52; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.price} €</td></tr>
            </table>
          </div>
          <p style="font-size: 13px; color: #979086; line-height: 1.6; margin: 0;">V prípade otázok nás kontaktujte. Tešíme sa na vašu návštevu!</p>
        </div>
        <div style="text-align: center; padding: 20px;">
          <a href="https://beauty-app-lac.vercel.app" style="display: inline-block; padding: 12px 28px; background: #1C1C1B; color: #F5F0EA; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">Otvoriť BeautyTime</a>
        </div>
        <p style="text-align: center; font-size: 11px; color: #B7AC9B; margin-top: 20px;">© 2025 BeautyTime · Rezervačný systém pre salóny</p>
      </div>
    `,
  }),

  booking_cancelled: (data) => ({
    subject: `Rezervácia zrušená — ${data.serviceName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F5F0EA; padding: 40px 20px;">
        <div style="background: #1C1C1B; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #D4C5B0; font-weight: 400; margin: 0 0 8px;">BeautyTime</h1>
        </div>
        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px; margin-bottom: 16px;">
          <p style="font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #979086; margin: 0 0 12px;">Zrušenie rezervácie</p>
          <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1C1C1B; font-weight: 400; margin: 0 0 24px;">Vaša rezervácia bola zrušená</h2>
          <div style="background: #F5F0EA; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em;">Služba</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Dátum</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Čas</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.time}</td></tr>
            </table>
          </div>
          <p style="font-size: 13px; color: '#979086'; line-height: 1.6; margin: 0;">Môžete si rezervovať nový termín cez BeautyTime.</p>
        </div>
        <div style="text-align: center; padding: 20px;">
          <a href="https://beauty-app-lac.vercel.app" style="display: inline-block; padding: 12px 28px; background: #1C1C1B; color: #F5F0EA; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">Rezervovať znova</a>
        </div>
        <p style="text-align: center; font-size: 11px; color: #B7AC9B; margin-top: 20px;">© 2025 BeautyTime</p>
      </div>
    `,
  }),

  last_minute: (data) => ({
    subject: `⚡ Last Minute termín — ${data.serviceName} o ${data.time}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F5F0EA; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #D4C5B0, #A89070); border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(28,28,27,0.6); margin: 0 0 8px;">Last Minute ponuka</p>
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1C1C1B; font-weight: 400; margin: 0;">BeautyTime</h1>
        </div>
        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px; margin-bottom: 16px;">
          <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1C1C1B; font-weight: 400; margin: 0 0 8px;">Voľný termín práve teraz!</h2>
          <p style="font-size: 13px; color: #979086; margin: 0 0 24px;">Rýchlo si zarezervujte — termíny sa rýchlo obsadzujú.</p>
          <div style="background: #F5F0EA; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em;">Salón</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right;">${data.salonName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Služba</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Dátum</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Čas</td><td style="padding: 8px 0; font-size: 14px; color: #6A5D52; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.time}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Cena</td><td style="padding: 8px 0; font-size: 14px; color: #6A5D52; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.price} €</td></tr>
            </table>
          </div>
          <div style="text-align: center;">
            <a href="${data.bookingUrl}" style="display: inline-block; padding: 14px 32px; background: #1C1C1B; color: #F5F0EA; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">Rezervovať teraz →</a>
          </div>
        </div>
        <p style="text-align: center; font-size: 11px; color: #B7AC9B; margin-top: 20px;">© 2025 BeautyTime · Ak si nechcete dostávať tieto správy, zmeňte nastavenia notifikácií.</p>
      </div>
    `,
  }),

  reminder: (data) => ({
    subject: `Pripomienka — zajtra o ${data.time} — ${data.serviceName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F5F0EA; padding: 40px 20px;">
        <div style="background: #1C1C1B; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #D4C5B0; font-weight: 400; margin: 0 0 8px;">BeautyTime</h1>
        </div>
        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px; margin-bottom: 16px;">
          <p style="font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #979086; margin: 0 0 12px;">Pripomienka</p>
          <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1C1C1B; font-weight: 400; margin: 0 0 8px;">Zajtra máte rezerváciu</h2>
          <p style="font-size: 13px; color: #979086; margin: 0 0 24px;">Nezabudnite na váš termín v ${data.salonName}.</p>
          <div style="background: #F5F0EA; border-radius: 14px; padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em;">Služba</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Dátum</td><td style="padding: 8px 0; font-size: 14px; color: #1C1C1B; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.date}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #979086; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid #E2E2DE;">Čas</td><td style="padding: 8px 0; font-size: 14px; color: #6A5D52; font-weight: 500; text-align: right; border-top: 1px solid #E2E2DE;">${data.time}</td></tr>
            </table>
          </div>
        </div>
        <p style="text-align: center; font-size: 11px; color: #B7AC9B; margin-top: 20px;">© 2025 BeautyTime</p>
      </div>
    `,
  }),
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, to, data } = req.body;
  if (!type || !to || !data) return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return res.status(500).json({ error: 'Missing email config' });

  const template = templates[type];
  if (!template) return res.status(400).json({ error: 'Unknown template: ' + type });

  try {
    const { subject, html } = template(data);
    await transporter.sendMail({
      from: `"BeautyTime" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(500).json({ error: err.message });
  }
};
