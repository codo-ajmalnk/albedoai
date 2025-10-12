"""
Email utility functions for sending notifications.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.settings import get_settings


def send_feedback_confirmation_email(
    recipient_email: str,
    recipient_name: str,
    subject: str,
    message: str,
    token: str,
) -> bool:
    """
    Send a confirmation email to the user after they submit feedback.

    Args:
        recipient_email: User's email address
        recipient_name: User's name (optional, can be empty)
        subject: Subject of the feedback
        message: The feedback message
        token: Tracking token for the feedback

    Returns:
        True if email was sent successfully, False otherwise
    """
    settings = get_settings()

    # If email is disabled or not configured, just log and return
    print(f"Enable email: {settings.enable_email}")
    print(f"SMTP username: {settings.smtp_username}")
    if not settings.enable_email or not settings.smtp_username:
        print(f"[EMAIL DISABLED] Would send email to {recipient_email}")
        print(f"Tracking URL: {settings.frontend_url}/support/track/{token}")
        return True

    try:
        # Create tracking URL
        tracking_url = f"{settings.frontend_url}/support/track/{token}"

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Support Request Received - {subject}"
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = recipient_email

        # Create plain text version
        text_content = f"""
Hello {recipient_name or 'there'},

Thank you for contacting Albedo Support!

We have received your support request and our team will review it shortly.

Support Request Details:
------------------------
Subject: {subject}
Tracking ID: {token}

Your Message:
{message}

Track Your Request:
You can track the status of your request at any time using this link:
{tracking_url}

We aim to respond within 24 hours. You'll receive an email notification when our team responds.

If you have any urgent concerns, please don't hesitate to reach out to us directly at support@albedoedu.com.

Best regards,
Albedo Support Team

---
This is an automated message. Please do not reply to this email.
        """.strip()

        # Create HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }}
        .content {{
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }}
        .details-box {{
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }}
        .tracking-button {{
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Support Request Received</h1>
    </div>
    <div class="content">
        <p>Hello {recipient_name or 'there'},</p>
        
        <p>Thank you for contacting <strong>Albedo Support</strong>!</p>
        
        <p>We have received your support request and our team will review it shortly.</p>
        
        <div class="details-box">
            <h3 style="margin-top: 0;">Support Request Details</h3>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Tracking ID:</strong> <code>{token}</code></p>
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap;">{message}</p>
        </div>
        
        <p style="text-align: center;">
            <a href="{tracking_url}" class="tracking-button">
                Track Your Request
            </a>
        </p>
        
        <p>You can track the status of your request at any time using the button above or this link:</p>
        <p><a href="{tracking_url}">{tracking_url}</a></p>
        
        <p>We aim to respond within <strong>24 hours</strong>. You'll receive an email notification when our team responds.</p>
        
        <p>If you have any urgent concerns, please don't hesitate to reach out to us directly at 
        <a href="mailto:support@albedoedu.com">support@albedoedu.com</a>.</p>
        
        <p>Best regards,<br>
        <strong>Albedo Support Team</strong></p>
        
        <div class="footer">
            This is an automated message. Please do not reply to this email.
        </div>
    </div>
</body>
</html>
        """.strip()

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        print(f"[EMAIL SENT] Confirmation email sent to {recipient_email}")
        return True

    except Exception as e:
        print(
            f"[EMAIL ERROR] Failed to send email to {recipient_email}: {str(e)}")
        # Don't fail the feedback submission if email fails
        return False


def send_feedback_response_email(
    recipient_email: str,
    recipient_name: str,
    subject: str,
    admin_response: str,
    token: str,
) -> bool:
    """
    Send an email notification when admin responds to feedback.

    Args:
        recipient_email: User's email address
        recipient_name: User's name
        subject: Subject of the original feedback
        admin_response: Admin's response
        token: Tracking token for the feedback

    Returns:
        True if email was sent successfully, False otherwise
    """
    settings = get_settings()

    if not settings.enable_email or not settings.smtp_username:
        print(
            f"[EMAIL DISABLED] Would send response email to {recipient_email}")
        return True

    try:
        tracking_url = f"{settings.frontend_url}/support/track/{token}"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Response to Your Support Request - {subject}"
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = recipient_email

        text_content = f"""
Hello {recipient_name or 'there'},

Our support team has responded to your request!

Subject: {subject}
Tracking ID: {token}

Support Team Response:
{admin_response}

View Full Conversation:
{tracking_url}

If you have any follow-up questions, please reply to this ticket or contact us at support@albedoedu.com.

Best regards,
Albedo Support Team
        """.strip()

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }}
        .content {{
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }}
        .response-box {{
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
        }}
        .button {{
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ We've Responded!</h1>
    </div>
    <div class="content">
        <p>Hello {recipient_name or 'there'},</p>
        
        <p>Our support team has responded to your request!</p>
        
        <div class="response-box">
            <h3 style="margin-top: 0;">Support Team Response</h3>
            <p style="white-space: pre-wrap;">{admin_response}</p>
        </div>
        
        <p style="text-align: center;">
            <a href="{tracking_url}" class="button">
                View Full Conversation
            </a>
        </p>
        
        <p><strong>Subject:</strong> {subject}<br>
        <strong>Tracking ID:</strong> {token}</p>
        
        <p>If you have any follow-up questions, please reply to this ticket or contact us at 
        <a href="mailto:support@albedoedu.com">support@albedoedu.com</a>.</p>
        
        <p>Best regards,<br>
        <strong>Albedo Support Team</strong></p>
    </div>
</body>
</html>
        """.strip()

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        print(f"[EMAIL SENT] Response email sent to {recipient_email}")
        return True

    except Exception as e:
        print(
            f"[EMAIL ERROR] Failed to send response email to {recipient_email}: {str(e)}")
        return False


def send_user_creation_email(
    recipient_email: str,
    username: str,
    password: str,
    role: str,
) -> bool:
    """
    Send account creation email to new user with credentials.

    Args:
        recipient_email: New user's email address
        username: Username for login
        password: Temporary password
        role: User's role (admin, moderator, user)

    Returns:
        True if email was sent successfully, False otherwise
    """
    settings = get_settings()

    # If email is disabled or not configured, just log and return
    if not settings.enable_email or not settings.smtp_username:
        print(
            f"[EMAIL DISABLED] Would send account creation email to {recipient_email}")
        print(f"Username: {username}, Role: {role}")
        return True

    try:
        login_url = f"{settings.frontend_url}/login"

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to Albedo - Account Created"
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = recipient_email

        # Create plain text version
        text_content = f"""
Hello,

Your Albedo account has been created successfully!

Account Details:
----------------
Username: {username}
Password: {password}
Role: {role.capitalize()}

Login URL: {login_url}

Security Reminder:
- Please change your password after your first login
- Keep your credentials secure and do not share them with anyone
- If you did not request this account, please contact us immediately

Getting Started:
1. Visit the login page using the link above
2. Sign in with your username and password
3. You'll have access to the admin dashboard based on your role

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
Albedo Support Team

---
This is an automated message from Albedo Support System.
        """.strip()

        # Create HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }}
        .content {{
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }}
        .credentials {{
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}
        .credential-item {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }}
        .credential-item:last-child {{
            border-bottom: none;
        }}
        .credential-label {{
            font-weight: 600;
            color: #6b7280;
        }}
        .credential-value {{
            font-family: 'Courier New', monospace;
            color: #111827;
        }}
        .button {{
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .warning {{
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 28px;">Welcome to Albedo</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created</p>
    </div>
    
    <div class="content">
        <p>Hello,</p>
        
        <p>Your Albedo account has been created successfully! Below are your login credentials:</p>
        
        <div class="credentials">
            <div class="credential-item">
                <span class="credential-label">Username:</span>
                <span class="credential-value">{username}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Password:</span>
                <span class="credential-value">{password}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Role:</span>
                <span class="credential-value">{role.capitalize()}</span>
            </div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Security Reminder:</strong><br>
            • Please change your password after your first login<br>
            • Keep your credentials secure and do not share them<br>
            • If you didn't request this account, contact us immediately
        </div>
        
        <center>
            <a href="{login_url}" class="button">Login to Your Account</a>
        </center>
        
        <h3>Getting Started:</h3>
        <ol>
            <li>Click the button above to go to the login page</li>
            <li>Sign in with your username and password</li>
            <li>You'll have access to features based on your role</li>
        </ol>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <div class="footer">
            <p>Best regards,<br>Albedo Support Team</p>
            <p style="font-size: 12px; color: #9ca3af;">
                This is an automated message from Albedo Support System.
            </p>
        </div>
    </div>
</body>
</html>
        """.strip()

        # Attach parts
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        print(f"[EMAIL SENT] Account creation email sent to {recipient_email}")
        return True

    except Exception as e:
        print(
            f"[EMAIL ERROR] Failed to send account creation email to {recipient_email}: {str(e)}")
        return False
