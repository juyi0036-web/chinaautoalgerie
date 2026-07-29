import { Resend } from 'resend';

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const resend = new Resend(apiKey);
    const body = await request.json();
    const { name, email, phone, city, model, budget, message } = body;

    const modelName = model || 'Non spécifié';
    const cityName = city || 'Non spécifiée';
    const budgetValue = budget || 'Non spécifié';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0F6E56; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🇩🇿 Nouvelle demande client</h1>
          <p style="color: #E1F5EE; margin: 8px 0 0; font-size: 14px;">China Auto Algérie</p>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 120px;">Nom</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Téléphone</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(email || 'Non renseigné')}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Ville</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(cityName)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Modèle</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #0F6E56; font-weight: 600;">${escapeHtml(modelName)}</td></tr>
            <tr><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Budget</td><td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${escapeHtml(budgetValue)}</td></tr>
            <tr><td style="padding: 12px 8px; font-weight: 600; color: #374151; vertical-align: top;">Message</td><td style="padding: 12px 8px; color: #1f2937; white-space: pre-wrap;">${escapeHtml(message || 'Aucun message')}</td></tr>
          </table>
        </div>
        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          Reçu via chinaautoalgerie.com
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'China Auto Algérie <contact@chinaautoalgerie.com>',
      to: ['contact@chinaautoalgerie.com'],
      replyTo: email || undefined,
      subject: `Nouvelle demande - ${name} - ${modelName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ message: 'Email sent successfully', id: data?.id });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
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
