import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates = {
  'feedback-acknowledgment': (data: any) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Request Received</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Request Received</h1>
            <p>Thank you for contacting Albedo Support</p>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We've received your support request and our team will get back to you as soon as possible.</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p>You can track the status of your request using the link below:</p>
            <a href="${process.env.CORS_ORIGIN}/support/track/${data.token}" class="button">Track Your Request</a>
            <p>If you have any additional information to add, please reply to this email.</p>
            <p>Best regards,<br>The Albedo Support Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${data.name},
      
      We've received your support request and our team will get back to you as soon as possible.
      
      Subject: ${data.subject}
      Category: ${data.category}
      
      Track your request: ${process.env.CORS_ORIGIN}/support/track/${data.token}
      
      If you have any additional information to add, please reply to this email.
      
      Best regards,
      The Albedo Support Team
    `
  }),
  
  'feedback-reply': (data: any) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Support Reply</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .reply { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 0 6px 6px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Reply</h1>
            <p>You have a new response from our support team</p>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We've responded to your support request: <strong>${data.subject}</strong></p>
            <div class="reply">
              <p>${data.reply.replace(/\n/g, '<br>')}</p>
            </div>
            <p>If you need further assistance, please reply to this email or track your request using the link below:</p>
            <a href="${process.env.CORS_ORIGIN}/support/track/${data.token}" class="button">Track Your Request</a>
            <p>Best regards,<br>The Albedo Support Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${data.name},
      
      We've responded to your support request: ${data.subject}
      
      Reply:
      ${data.reply}
      
      If you need further assistance, please reply to this email or track your request: ${process.env.CORS_ORIGIN}/support/track/${data.token}
      
      Best regards,
      The Albedo Support Team
    `
  })
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    const template = templates[options.template as keyof typeof templates];
    
    if (!template) {
      throw new Error(`Template ${options.template} not found`);
    }

    const { html, text } = template(options.data);

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html,
      text
    });

    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendTestEmail = async (to: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Test Email - Albedo Support',
    template: 'feedback-acknowledgment',
    data: {
      name: 'Test User',
      subject: 'Test Support Request',
      category: 'General',
      token: 'test-token-123'
    }
  });
};
