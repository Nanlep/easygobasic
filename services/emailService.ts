
/**
 * Email service proxying requests to the secure backend.
 */
export const EmailService = {
  /**
   * Sends a confirmation email to the user via the internal API.
   */
  sendUserConfirmation: async (email: string, name: string, data: any, type: 'REQUEST' | 'APPOINTMENT') => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: 'USER_CONFIRMATION',
          type,
          email,
          name,
          data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try { errorJson = JSON.parse(errorText); } catch(e) {}
        console.error(`[EMAIL PROXY] Server Error ${response.status}:`, errorJson || errorText);
      } else {
        console.log("[EMAIL PROXY] User confirmation triggered successfully.");
      }
    } catch (error) {
      console.error("[EMAIL PROXY] Network connectivity error:", error);
    }
  },

  /**
   * Sends an internal notification to the admin via the internal API.
   */
  sendAdminNotification: async (type: 'REQUEST' | 'APPOINTMENT', data: any) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: 'ADMIN_ALERT',
          type,
          data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ADMIN EMAIL PROXY] Server Error ${response.status}:`, errorText);
      } else {
        console.log("[ADMIN EMAIL PROXY] Admin notification triggered successfully.");
      }
    } catch (error) {
      console.error("[ADMIN EMAIL PROXY] Network connectivity error:", error);
    }
  },

  /**
   * Sends a welcome email to newly provisioned staff.
   */
  sendWelcomeEmail: async (email: string, name: string, role: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationType: 'WELCOME_STAFF',
          email,
          name,
          role,
          data: { provisioned: true } // Filler data to satisfy API
        })
      });

      if (!response.ok) {
        console.error("[WELCOME EMAIL PROXY] Server Error:", await response.text());
      } else {
        console.log("[WELCOME EMAIL PROXY] Welcome email sent successfully.");
      }
    } catch (error) {
      console.error("[WELCOME EMAIL PROXY] Network connectivity error:", error);
    }
  }
};
