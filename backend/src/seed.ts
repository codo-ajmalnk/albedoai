import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@albedoedu.com' },
    update: {},
    create: {
      email: 'admin@albedoedu.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create support agent
  const supportAgent = await prisma.user.upsert({
    where: { email: 'support@albedoedu.com' },
    update: {},
    create: {
      email: 'support@albedoedu.com',
      password: hashedPassword,
      name: 'Support Agent',
      role: 'SUPPORT_AGENT'
    }
  });

  console.log('✅ Support agent created:', supportAgent.email);

  // Create categories
  const categories = [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Learn the basics of using Albedo',
      icon: '🚀',
      color: '#3b82f6',
      order: 1
    },
    {
      name: 'Account & Billing',
      slug: 'account-billing',
      description: 'Manage your account and billing information',
      icon: '💳',
      color: '#10b981',
      order: 2
    },
    {
      name: 'Technical Issues',
      slug: 'technical-issues',
      description: 'Troubleshoot technical problems',
      icon: '🔧',
      color: '#f59e0b',
      order: 3
    },
    {
      name: 'Features & Usage',
      slug: 'features-usage',
      description: 'Learn about Albedo features and how to use them',
      icon: '⭐',
      color: '#8b5cf6',
      order: 4
    },
    {
      name: 'API & Integration',
      slug: 'api-integration',
      description: 'Developer resources and API documentation',
      icon: '🔌',
      color: '#06b6d4',
      order: 5
    }
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    });
    console.log(`✅ Category created: ${category.name}`);
  }

  // Create sample articles
  const gettingStartedCategory = await prisma.category.findUnique({
    where: { slug: 'getting-started' }
  });

  const accountBillingCategory = await prisma.category.findUnique({
    where: { slug: 'account-billing' }
  });

  const technicalCategory = await prisma.category.findUnique({
    where: { slug: 'technical-issues' }
  });

  const articles = [
    {
      title: 'Welcome to Albedo - Your First Steps',
      slug: 'welcome-to-albedo-first-steps',
      content: `
# Welcome to Albedo!

Welcome to Albedo, the comprehensive educational platform designed to enhance your learning experience. This guide will help you get started with the essential features.

## Creating Your Account

1. **Sign Up**: Visit our registration page and create your account
2. **Verify Email**: Check your email for verification link
3. **Complete Profile**: Add your personal information and preferences

## Dashboard Overview

Your dashboard is your central hub for all activities:

- **Recent Courses**: Quick access to your enrolled courses
- **Progress Tracking**: Monitor your learning progress
- **Notifications**: Stay updated with important announcements
- **Quick Actions**: Common tasks and shortcuts

## Key Features

### Course Management
- Browse and enroll in courses
- Track your progress
- Access course materials
- Participate in discussions

### Learning Tools
- Interactive lessons
- Quizzes and assessments
- Progress tracking
- Certificates upon completion

## Getting Help

If you need assistance:
- Check our FAQ section
- Contact support through the help center
- Join our community forums
- Use the live chat feature

## Next Steps

1. Complete your profile setup
2. Explore available courses
3. Join your first course
4. Connect with other learners

Welcome aboard, and happy learning!
      `,
      excerpt: 'Get started with Albedo by learning the basics of account creation, dashboard navigation, and key features.',
      tags: ['getting-started', 'basics', 'tutorial'],
      categoryId: gettingStartedCategory?.id,
      isPublished: true,
      isFeatured: true,
      order: 1
    },
    {
      title: 'How to Reset Your Password',
      slug: 'how-to-reset-password',
      content: `
# How to Reset Your Password

If you've forgotten your password or need to change it for security reasons, follow these steps:

## Method 1: Password Reset Email

1. Go to the login page
2. Click "Forgot Password?" link
3. Enter your email address
4. Check your email for reset instructions
5. Click the reset link in the email
6. Enter your new password twice
7. Click "Reset Password"

## Method 2: Change Password from Account Settings

If you're already logged in:

1. Go to your account settings
2. Click on "Security" tab
3. Click "Change Password"
4. Enter your current password
5. Enter your new password
6. Confirm your new password
7. Click "Update Password"

## Password Requirements

Your password must meet these criteria:
- At least 8 characters long
- Contains uppercase and lowercase letters
- Contains at least one number
- Contains at least one special character (!@#$%^&*)

## Troubleshooting

**Didn't receive the reset email?**
- Check your spam/junk folder
- Wait a few minutes and try again
- Contact support if the issue persists

**Reset link expired?**
- Password reset links expire after 1 hour
- Request a new reset link
- Try the process again

**Still having issues?**
- Contact our support team
- Provide your email address
- We'll help you regain access
      `,
      excerpt: 'Learn how to reset your password using email or account settings, including troubleshooting tips.',
      tags: ['password', 'security', 'account', 'troubleshooting'],
      categoryId: accountBillingCategory?.id,
      isPublished: true,
      isFeatured: false,
      order: 1
    },
    {
      title: 'Troubleshooting Login Issues',
      slug: 'troubleshooting-login-issues',
      content: `
# Troubleshooting Login Issues

Having trouble logging into your Albedo account? This guide will help you resolve common login problems.

## Common Login Issues

### 1. Incorrect Credentials
**Symptoms**: "Invalid email or password" error
**Solutions**:
- Double-check your email address
- Ensure Caps Lock is off
- Try typing your password in a text editor first
- Use the "Show Password" option if available

### 2. Account Not Verified
**Symptoms**: Login appears successful but you're redirected to verification page
**Solutions**:
- Check your email for verification link
- Look in spam/junk folder
- Request a new verification email
- Contact support if verification email is missing

### 3. Browser Issues
**Symptoms**: Login form doesn't work or page loads incorrectly
**Solutions**:
- Clear browser cache and cookies
- Try a different browser
- Disable browser extensions temporarily
- Update your browser to the latest version

### 4. Network Problems
**Symptoms**: Page won't load or times out
**Solutions**:
- Check your internet connection
- Try a different network (mobile hotspot)
- Disable VPN if using one
- Check if your firewall is blocking the site

## Advanced Troubleshooting

### Clear Browser Data
1. Open browser settings
2. Go to Privacy/Security section
3. Clear browsing data
4. Select "All time" as time range
5. Check "Cookies" and "Cached images and files"
6. Click "Clear data"

### Disable Browser Extensions
1. Open browser in incognito/private mode
2. Try logging in
3. If successful, disable extensions one by one
4. Identify the problematic extension

### Check System Time
- Ensure your computer's date and time are correct
- Incorrect system time can cause authentication issues

## Still Having Problems?

If none of these solutions work:

1. **Contact Support**: Reach out to our support team
2. **Provide Details**: Include your email, browser type, and error messages
3. **Screenshots**: Attach screenshots of any error messages
4. **Alternative Access**: We can help you regain access to your account

## Prevention Tips

- Use a password manager
- Enable two-factor authentication
- Keep your browser updated
- Use a secure, stable internet connection
- Bookmark the official login page
      `,
      excerpt: 'Comprehensive guide to troubleshooting common login issues including browser problems, network issues, and account verification.',
      tags: ['login', 'troubleshooting', 'browser', 'network', 'support'],
      categoryId: technicalCategory?.id,
      isPublished: true,
      isFeatured: true,
      order: 1
    }
  ];

  for (const articleData of articles) {
    if (!articleData.categoryId) {
      console.log(`⚠️ Skipping article ${articleData.title} - no category found`);
      continue;
    }
    
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {},
      create: {
        ...articleData,
        categoryId: articleData.categoryId!
      }
    });
    console.log(`✅ Article created: ${article.title}`);
  }

  // Create sample feedback
  const sampleFeedback = [
    {
      email: 'user1@example.com',
      name: 'John Doe',
      subject: 'Unable to access my course materials',
      message: 'I enrolled in the React course but I cannot access the course materials. When I click on the course, it shows an error message. Please help.',
      categoryId: technicalCategory?.id,
      status: 'OPEN' as const,
      priority: 'HIGH' as const
    },
    {
      email: 'user2@example.com',
      name: 'Jane Smith',
      subject: 'Billing question about subscription',
      message: 'I was charged twice for my monthly subscription. Can you please check my account and refund the duplicate charge?',
      categoryId: accountBillingCategory?.id,
      status: 'IN_PROGRESS' as const,
      priority: 'MEDIUM' as const
    },
    {
      email: 'user3@example.com',
      name: 'Mike Johnson',
      subject: 'Feature request: Dark mode',
      message: 'I would love to see a dark mode option for the platform. It would be much easier on the eyes during night study sessions.',
      categoryId: gettingStartedCategory?.id,
      status: 'CLOSED' as const,
      priority: 'LOW' as const
    }
  ];

  for (const feedbackData of sampleFeedback) {
    const feedback = await prisma.feedback.create({
      data: feedbackData
    });
    console.log(`✅ Sample feedback created: ${feedback.subject}`);
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
