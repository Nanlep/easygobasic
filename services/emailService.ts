
/**
 * Mocking a robust email service. In a real production environment, 
 * you would use Resend, SendGrid, or AWS SES.
 */

export const EmailService = {
  sendUserConfirmation: async (email: string, name: string, data: any, type: 'REQUEST' | 'APPOINTMENT') => {
    console.log(`[EMAIL] Sending confirmation to User: ${email}`);
    // Format text data only
    const textData = Object.entries(data)
      .filter(([key]) => key !== 'prescription' && key !== 'attachment')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const body = {
      to: email,
      subject: `Confirmation: Your ${type === 'REQUEST' ? 'Drug Request' : 'Medical Consultation'} - EasygoPharm`,
      text: `Hello ${name},\n\nWe have received your ${type === 'REQUEST' ? 'drug sourcing request' : 'appointment booking'}. Our team is processing it now.\n\nDetails provided:\n${textData}\n\nThank you for choosing EasygoPharm.`,
    };
    
    // Simulate API call
    return new Promise((resolve) => setTimeout(resolve, 800));
  },

  sendAdminNotification: async (type: 'REQUEST' | 'APPOINTMENT', data: any) => {
    console.log(`[EMAIL] Sending internal alert to EasygoPharm Admins`);
    const internalEmail = 'admin@easygopharm.com';
    
    const body = {
      to: internalEmail,
      subject: `URGENT: New ${type} Submitted`,
      text: `A new ${type} has been submitted to the platform.\n\nFull Payload:\n${JSON.stringify(data, null, 2)}`,
    };

    // Simulate API call
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
};
