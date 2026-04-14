export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Missing GMAIL_USER or GMAIL_PASS' });
  }

  const { type, to, data } = req.body;
  if (!type || !to || !data) return res.status(400).json({ error: 'Missing fields' });

  const templates = {
    booking_confirmed: (d) => ({
      subject: `Rezervácia potvrdená — ${d.serviceName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EA;padding:40px 20px">
        <div style="background:#1C1C1B;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px">
          <h1 style="font-family:Georgia,serif;font-size:28px;color:#D4C5B0;font-weight:400;margin:0 0 8px">BeautyTime</h1>
          <p style="font-size:12px;color:#6A5D52;letter-spacing:0.15em;text-transform:uppercase;margin:0">Rezervačný systém</p>
        </div>
        <div style="background:#FFFFFF;border-radius:20px;padding:32px;margin-bottom:16px">
          <h2 style="font-family:Georgia,serif;font-size:24px;color:#1C1C1B;font-weight:400;margin:0 0 24px">Vaša rezervácia je potvrdená ✓</h2>
          <div style="background:#F5F0EA;border-radius:14px;padding:20px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;letter-spacing:0.1em">Salón</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right">${d.salonName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #E2E2DE">Služba</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.serviceName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #E2E2DE">Dátum</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.date}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #E2E2DE">Čas</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.time}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid #E2E2DE">Cena</td><td style="padding:8px 0;font-size:14px;color:#6A5D52;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.price} €</td></tr>
            </table>
          </div>
          <p style="font-size:13px;color:#979086;line-height:1.6;margin:0">Tešíme sa na vašu návštevu!</p>
        </div>
        <div style="text-align:center;padding:20px">
          <a href="https://beauty-app-lac.vercel.app" style="display:inline-block;padding:12px 28px;background:#1C1C1B;color:#F5F0EA;text-decoration:none;border-radius:12px;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase">Otvoriť BeautyTime</a>
        </div>
        <p style="text-align:center;font-size:11px;color:#B7AC9B;margin-top:20px">© 2025 BeautyTime</p>
      </div>`,
    }),
    booking_cancelled: (d) => ({
      subject: `Rezervácia zrušená — ${d.serviceName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EA;padding:40px 20px">
        <div style="background:#1C1C1B;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px">
          <h1 style="font-family:Georgia,serif;font-size:28px;color:#D4C5B0;font-weight:400;margin:0">BeautyTime</h1>
        </div>
        <div style="background:#FFFFFF;border-radius:20px;padding:32px">
          <h2 style="font-family:Georgia,serif;font-size:24px;color:#1C1C1B;font-weight:400;margin:0 0 24px">Rezervácia bola zrušená</h2>
          <div style="background:#F5F0EA;border-radius:14px;padding:20px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase">Služba</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right">${d.serviceName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Dátum</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.date}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Čas</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.time}</td></tr>
            </table>
          </div>
          <div style="text-align:center">
            <a href="https://beauty-app-lac.vercel.app" style="display:inline-block;padding:12px 28px;background:#1C1C1B;color:#F5F0EA;text-decoration:none;border-radius:12px;font-size:12px;font-weight:500;text-transform:uppercase">Rezervovať znova</a>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#B7AC9B;margin-top:20px">© 2025 BeautyTime</p>
      </div>`,
    }),
    last_minute: (d) => ({
      subject: `⚡ Last Minute — ${d.serviceName} o ${d.time}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EA;padding:40px 20px">
        <div style="background:linear-gradient(135deg,#D4C5B0,#A89070);border-radius:20px;padding:32px;text-align:center;margin-bottom:24px">
          <h1 style="font-family:Georgia,serif;font-size:28px;color:#1C1C1B;font-weight:400;margin:0">BeautyTime</h1>
          <p style="font-size:11px;color:rgba(28,28,27,0.6);letter-spacing:0.2em;text-transform:uppercase;margin:8px 0 0">Last Minute ponuka</p>
        </div>
        <div style="background:#FFFFFF;border-radius:20px;padding:32px">
          <h2 style="font-family:Georgia,serif;font-size:24px;color:#1C1C1B;font-weight:400;margin:0 0 8px">Voľný termín práve teraz!</h2>
          <p style="font-size:13px;color:#979086;margin:0 0 24px">Termíny sa rýchlo obsadzujú — rezervujte hneď.</p>
          <div style="background:#F5F0EA;border-radius:14px;padding:20px;margin-bottom:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase">Salón</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right">${d.salonName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Služba</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.serviceName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Dátum</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.date}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Čas</td><td style="padding:8px 0;font-size:14px;color:#6A5D52;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.time}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Cena</td><td style="padding:8px 0;font-size:14px;color:#6A5D52;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.price} €</td></tr>
            </table>
          </div>
          <div style="text-align:center">
            <a href="${d.bookingUrl}" style="display:inline-block;padding:14px 32px;background:#1C1C1B;color:#F5F0EA;text-decoration:none;border-radius:12px;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase">Rezervovať teraz →</a>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#B7AC9B;margin-top:20px">© 2025 BeautyTime</p>
      </div>`,
    }),
    reminder: (d) => ({
      subject: `Pripomienka — zajtra o ${d.time} — ${d.serviceName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#F5F0EA;padding:40px 20px">
        <div style="background:#1C1C1B;border-radius:20px;padding:32px;text-align:center;margin-bottom:24px">
          <h1 style="font-family:Georgia,serif;font-size:28px;color:#D4C5B0;font-weight:400;margin:0">BeautyTime</h1>
        </div>
        <div style="background:#FFFFFF;border-radius:20px;padding:32px">
          <h2 style="font-family:Georgia,serif;font-size:24px;color:#1C1C1B;font-weight:400;margin:0 0 8px">Zajtra máte rezerváciu</h2>
          <p style="font-size:13px;color:#979086;margin:0 0 24px">Nezabudnite na váš termín v ${d.salonName}.</p>
          <div style="background:#F5F0EA;border-radius:14px;padding:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase">Služba</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right">${d.serviceName}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Dátum</td><td style="padding:8px 0;font-size:14px;color:#1C1C1B;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.date}</td></tr>
              <tr><td style="padding:8px 0;font-size:12px;color:#979086;text-transform:uppercase;border-top:1px solid #E2E2DE">Čas</td><td style="padding:8px 0;font-size:14px;color:#6A5D52;font-weight:500;text-align:right;border-top:1px solid #E2E2DE">${d.time}</td></tr>
            </table>
          </div>
        </div>
        <p style="text-align:center;font-size:11px;color:#B7AC9B;margin-top:20px">© 2025 BeautyTime</p>
      </div>`,
    }),
  };

  const template = templates[type];
  if (!template) return res.status(400).json({ error: 'Unknown template: ' + type });

  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
    const { subject, html } = template(data);
    await transporter.sendMail({
      from: `"BeautyTime" <${gmailUser}>`,
      to,
      subject,
      html,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
