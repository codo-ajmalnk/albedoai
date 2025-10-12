# Email Configuration Guide

This guide explains how to set up email notifications for support request submissions and admin responses.

## Overview

The system can send two types of emails:

1. **Confirmation Email**: Sent to users when they submit a support request
2. **Response Email**: Sent to users when an admin responds to their request

## Configuration

### Environment Variables

Add these variables to your `backend/.env` file:

```env
# Email Settings
ENABLE_EMAIL=true                           # Set to true to enable email sending
SMTP_HOST=smtp.gmail.com                   # SMTP server (Gmail example)
SMTP_PORT=587                               # SMTP port (587 for TLS)
SMTP_USERNAME=your-email@gmail.com         # Your email address
SMTP_PASSWORD=your-app-password            # Your email password or app password
SMTP_FROM_EMAIL=noreply@albedoedu.com      # "From" email address
SMTP_FROM_NAME=Albedo Support              # "From" display name
FRONTEND_URL=http://localhost:5173         # Frontend URL for tracking links
```

## Gmail Setup (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Name it "Albedo Support"
4. Copy the 16-character password

### Step 3: Configure `.env`

```env
ENABLE_EMAIL=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-char app password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Albedo Support
FRONTEND_URL=frontend_url
```

## Other Email Providers

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
```

## Testing Email (Development Mode)

### Disable Email (Default)

If you don't configure email or set `ENABLE_EMAIL=false`, the system will:

- Continue to work normally
- Print email content to console logs instead of sending
- Show tracking URLs in the console

This is useful for development and testing without setting up SMTP.

### Example Console Output

```
[EMAIL DISABLED] Would send email to user@example.com
Tracking URL: http://localhost:5173/support/track/abc-123-def-456
```

## Email Templates

### Confirmation Email

Sent when a user submits a support request. Includes:

- Subject line and message preview
- Tracking ID
- Link to track the request status
- Expected response time (24 hours)

### Response Email

Sent when admin responds to a request. Includes:

- Admin's response
- Link to view full conversation
- Original request details

## Troubleshooting

### Email Not Sending

1. **Check Console Logs**

   ```bash
   # Look for email-related messages in backend logs
   [EMAIL SENT] Confirmation email sent to user@example.com
   # or
   [EMAIL ERROR] Failed to send email to user@example.com: ...
   ```

2. **Verify SMTP Credentials**

   - Test your credentials with an email client
   - Ensure App Password is used for Gmail (not regular password)
   - Check if SMTP access is enabled for your email provider

3. **Check Firewall/Network**

   - Ensure port 587 is not blocked
   - Try port 465 with SSL/TLS

4. **Common Errors**
   - `Authentication failed`: Wrong username/password
   - `Connection refused`: Wrong host or port
   - `SSL/TLS error`: Port mismatch (use 587 for STARTTLS)

### Gmail "Less secure app access"

Modern Gmail requires 2FA + App Passwords. Don't use "Less secure app access" as it's deprecated.

## Production Recommendations

1. **Use a Dedicated Email Service**

   - SendGrid, Mailgun, AWS SES, or similar
   - Better deliverability
   - Email analytics
   - Higher sending limits

2. **Use Custom Domain**

   - Set `SMTP_FROM_EMAIL` to `support@yourdomain.com`
   - Configure SPF, DKIM, DMARC records

3. **Environment Variables**

   - Never commit `.env` file to version control
   - Use secure secret management in production
   - Different configs for dev/staging/prod

4. **Error Handling**
   - Email failures won't block feedback submission
   - Failed emails are logged for monitoring
   - Consider adding retry logic for production

## Testing

### Manual Test

1. Configure email in `.env`
2. Restart backend server
3. Submit a support request from the frontend
4. Check your email inbox
5. Reply from admin panel and verify response email

### Quick Test Script

```python
# test_email.py
from backend.email_utils import send_feedback_confirmation_email

send_feedback_confirmation_email(
    recipient_email="test@example.com",
    recipient_name="Test User",
    subject="Test Support Request",
    message="This is a test message",
    token="test-token-123"
)
```

## Support

For issues or questions:

- Check backend console logs for detailed error messages
- Verify email provider documentation
- Test credentials with standard email client first
