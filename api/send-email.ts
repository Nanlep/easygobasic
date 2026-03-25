
import { Request, Response } from 'express';

// Use any for req and res to bypass environment-specific type conflicts with Express/DOM types in serverless handlers
export default async function handler(req: any, res: any) {
  // 1. Method Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'method_not_allowed'
    });
  }

  const { notificationType, type, email, name, data } = req.body;
  
  // 2. Secret & Config Validation
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'easygo@easygopharm.com';
  
  if (!apiKey) {
    console.error("[API] RESEND_API_KEY is missing in environment.");
    return res.status(500).json({ 
      error: 'Email service is not configured (Missing API Key).',
      code: 'missing_api_key'
    });
  }

  // 3. Payload Validation
  if (!notificationType || !data) {
    return res.status(400).json({ 
      error: 'Invalid payload: notificationType and data are required.',
      code: 'invalid_payload'
    });
  }

  try {
    const isUserConfirm = notificationType === 'USER_CONFIRMATION';
    const submissionType = type === 'REQUEST' ? 'Rare Drug Sourcing Request' : 'Medical Consultation Booking';
    
    // Determine recipient
    const recipient = isUserConfirm ? email : adminEmail;
    const subject = isUserConfirm ? `Confirmed: ${submissionType} Received` : `[ALERT] New ${submissionType} Submission`;

    if (isUserConfirm && !email) {
      return res.status(400).json({ error: 'User email is required for confirmation.', code: 'missing_email' });
    }

    /**
     * Resend Authorization Logic:
     * If FROM_EMAIL is missing, it defaults to onboarding@resend.dev.
     * Resend will REJECT (403) any email sent from onboarding@resend.dev to 
     * anyone except the account owner.
     */
    const finalFrom = fromEmail ? `EasygoPharm <${fromEmail}>` : `EasygoPharm <onboarding@resend.dev>`;
    
    if (!fromEmail) {
      console.warn("[API] WARNING: FROM_EMAIL is not set. Falling back to 'onboarding@resend.dev'. External delivery WILL fail.");
    }

    const timestampWAT = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' });

    const summary = Object.entries(data || {})
      .filter(([key]) => !['prescription', 'attachment', 'agreedToTerms', 'requesterTypeOther', 'submittedAt', 'drugs'].includes(key))
      .map(([key, value]) => `<li><strong>${key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> ${value}</li>`)
      .join('');

    const htmlContent = `
      <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header with Profile Picture / Logo -->
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <img src="https://easygopharm.com/Easygo_logo.png" alt="EasygoPharm Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 2px solid #ffffff;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">EasygoPharm</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #0f172a; margin-top: 0;">${isUserConfirm ? `Hello ${name || 'Valued Patient'},` : 'System Alert: New Submission'}</h2>
          <p>${isUserConfirm ? `We have successfully received your <strong>${submissionType}</strong>.` : `A new <strong>${submissionType}</strong> has been logged.`}</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;"><strong>Date & Time:</strong> ${timestampWAT} (WAT)</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.6;">${summary}</ul>
          </div>
          <!-- Email Signature -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
            <div style="display: flex; align-items: center; margin-top: 12px;">
              <img src="https://easygopharm.com/Easygo_logo.png" alt="Easygo Logo" style="width: 40px; height: 40px; border-radius: 8px; margin-right: 12px; object-fit: cover;" />
              <div>
                <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 16px;">EasygoPharm Team</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">Healthcare, simplified.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: finalFrom,
        to: [recipient],
        subject: subject,
        html: htmlContent,
      }),
    });

    const result: any = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[API] Resend API Error:", result);
      return res.status(resendResponse.status).json({
        error: result.message || 'Resend API failed to send email.',
        code: 'resend_api_error',
        details: result
      });
    }

    return res.status(200).json({ success: true, messageId: result.id });
  } catch (error: any) {
    console.error("[API] Internal Handler Error:", error);
    return res.status(500).json({ 
      error: 'An internal error occurred while processing the email.',
      code: 'internal_server_error',
      message: error.message
    });
  }
}
