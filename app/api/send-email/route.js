import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error('Gmail SMTP credentials not configured');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    });

    const body = await request.json();
    const { name, email, phone, city, model, budget, message } = body;

    const modelName = model || 'Non spécifié';
    const cityName = city || 'Non spécifiée';
    const budgetValue = budget || 'Non spécifié';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0F6E56; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Nouvelle demande client</h1>
          <p style="color: #E1F5EE; margin: 8px 0 0; font-size: 14px;">China Auto Algérie</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 120px;">Nom</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Telephone</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(email || 'Non renseigné')}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Ville</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(cityName)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Modele</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #0F6E56; font-weight: 600;">${escapeHtml(modelName)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Budget</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(budgetValue)}</td></tr>
            <tr><td style="padding: 12px 8px; font-weight: 600; color: #374151; vertical-align: top;">Message</td><td style="padding: 12px 8px; color: #1f2937; white-space: pre-wrap;">${escapeHtml(message || 'Aucun message')}</td></tr>
          </table>
        </div>
        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          Recu via chinaautoalgerie.com
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"China Auto Algérie" <contact@chinaautoalgerie.com>',
      to: 'juyi0036@gmail.com',
      replyTo: email || undefined,
      subject: `[China Auto Algérie] ${name} - ${modelName}`,
      html: htmlContent,
    });

    return Response.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
