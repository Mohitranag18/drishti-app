# Email Setup Guide for Drishti App

This guide explains how to set up and configure the email functionality for sending detailed weekly and monthly wellness summaries to users.

## Overview

The Drishti app now includes a comprehensive email system that sends detailed wellness summaries alongside in-app notifications. Users receive:
- **Weekly Summary Emails**: Detailed insights about their week's wellness activities
- **Monthly Report Emails**: Comprehensive monthly wellness reports with deep analysis
- **Milestone Celebrations**: Achievement notifications via email
- **Daily Reminders**: Optional daily reflection reminders

## Architecture

### Components

1. **Email Service** (`lib/emailService.js`)
   - Handles email sending logic
   - Manages email templates
   - Integrates with email providers (Resend recommended)

2. **Notification Service** (`lib/notificationService.js`)
   - Updated to send emails alongside notifications
   - Calls email service for weekly/monthly summaries

3. **Email Preferences API** (`app/api/user/email-preferences/route.js`)
   - Manages user email preferences
   - Provides endpoints for getting/setting preferences
   - Includes test email functionality

4. **Email Preferences UI** (`app/components/EmailPreferences.jsx`)
   - Beautiful interface for managing email settings
   - Real-time preference updates
   - Test email functionality

5. **User Model Updates** (`prisma/schema.prisma`)
   - Added `email_preferences` JSON field
   - Stores granular email settings

## Recommended Email Service: SendGrid

### Why SendGrid?

1. **Enterprise Ready**: Trusted by major companies worldwide
2. **Excellent Deliverability**: Advanced deliverability optimization
3. **Comprehensive Features**: Templates, analytics, and automation
4. **Great API**: Robust email API with excellent documentation
5. **Advanced Analytics**: Detailed tracking and insights

### Alternatives

- **Resend**: Simpler, but fewer enterprise features
- **AWS SES**: Cheaper but complex setup
- **Google Cloud Email**: Overkill for this use case

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @sendgrid/mail
```

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=notifications@yourdomain.com

# Optional: Custom email configuration
EMAIL_FROM_NAME="Drishti Wellness"
```

### 3. Set Up SendGrid Account

1. **Sign Up**: Create account at [sendgrid.com](https://sendgrid.com)
2. **Verify Sender Identity**: Add and verify your sending domain or single sender
3. **Get API Key**: Generate API key from dashboard
4. **Configure DNS**: Add DNS records for domain verification (SPF, DKIM, DMARC)

### 4. Database Migration

Run the database migration to add email preferences:

```bash
npx prisma migrate dev --name add_email_preferences
```

Or for production:

```bash
npx prisma migrate deploy
```

## Email Templates

### Weekly Summary Email

- **Header**: Week date range
- **Stats Grid**: Mood check-ins, journals, perspective sessions
- **Dominant Mood**: Visual mood representation
- **Growth Insights**: AI-generated insights
- **Achievement Highlights**: Weekly accomplishments
- **Challenges**: Areas for improvement
- **Recommendations**: Actionable suggestions
- **Detailed Summary**: Comprehensive analysis

### Monthly Report Email

- **Header**: Month and year
- **Highlight Box**: Month summary
- **Extended Stats**: Including wellness scores
- **Emotional Theme**: Dominant monthly mood
- **Key Growth Insights**: Monthly patterns
- **Major Achievements**: Significant milestones
- **Challenges Overcome**: Growth areas
- **Next Month Recommendations**: Forward-looking advice
- **In-Depth Analysis**: Comprehensive review

## User Preferences

### Available Options

- **weekly_summary**: Receive weekly summary emails
- **monthly_summary**: Receive monthly report emails
- **milestones**: Get milestone celebration emails
- **daily_reminders**: Optional daily reminder emails
- **enabled**: Master toggle for all emails

### Default Settings

New users get:
- Weekly summaries: ✅ Enabled
- Monthly summaries: ✅ Enabled
- Milestones: ✅ Enabled
- Daily reminders: ❌ Disabled
- Master toggle: ✅ Enabled

## Email Sending Process

### Automatic Emails

1. **Weekly Summaries**: Sent when weekly summaries are generated
2. **Monthly Summaries**: Sent when monthly reports are generated
3. **Milestones**: Sent when users achieve milestones

### Email Preferences Check

Before sending, the system:
1. Checks if user has email enabled
2. Verifies specific email type preference
3. Confirms user has valid email address
4. Respects individual preference settings

### Error Handling

- Email failures don't break notification creation
- Comprehensive error logging
- Graceful fallbacks
- User feedback for test emails

## Testing Email Functionality

### Manual Testing

1. **Test Emails**: Use Email Settings page to send test emails
2. **Preference Testing**: Toggle settings and verify behavior
3. **Template Testing**: Check email rendering across devices

### API Testing

```bash
# Test weekly summary email
curl -X POST /api/user/email-preferences \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly"}'

# Test monthly summary email
curl -X POST /api/user/email-preferences \
  -H "Content-Type: application/json" \
  -d '{"type": "monthly"}'
```

## Monitoring and Analytics

### SendGrid Dashboard

- Track delivery rates
- Monitor bounce rates
- View open/click statistics
- Manage suppression lists
- Advanced email analytics and reporting

### Application Monitoring

- Email service logs
- Error tracking
- Performance metrics
- User engagement metrics

## Best Practices

### Email Content

1. **Personalization**: Use user's name and data
2. **Visual Design**: Responsive, attractive templates
3. **Value Proposition**: Always provide useful insights
4. **Call to Action**: Encourage app engagement
5. **Unsubscribe Options**: Easy opt-out mechanisms

### Technical Considerations

1. **Rate Limiting**: Respect email provider limits
2. **Retry Logic**: Handle temporary failures
3. **Queue Management**: Process emails asynchronously
4. **Security**: Protect API keys and user data
5. **Compliance**: Follow email marketing regulations

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SENDGRID_API_KEY
   - Verify domain configuration
   - Check user email preferences

2. **Template Rendering Issues**
   - Validate HTML structure
   - Check CSS inlining
   - Test email clients

3. **Delivery Problems**
   - Verify DNS records
   - Check spam filters
   - Monitor bounce rates

### Debug Mode

Enable debug logging:

```env
DEBUG=email:*
```

## Security Considerations

1. **API Key Protection**: Never expose in client code
2. **User Privacy**: Respect email preferences
3. **Data Protection**: Secure email content
4. **Rate Limiting**: Prevent abuse
5. **Access Control**: Proper authentication

## Performance Optimization

1. **Email Queuing**: Process asynchronously
2. **Batch Processing**: Group similar emails
3. **Caching**: Cache templates and preferences
4. **Database Optimization**: Efficient preference queries
5. **CDN**: Host email assets on CDN

## Future Enhancements

### Planned Features

1. **Email Analytics Integration**: In-app email metrics
2. **Customizable Templates**: User email customization
3. **Scheduled Emails**: User-controlled timing
4. **Rich Content**: Interactive email elements
5. **A/B Testing**: Template optimization

### Scalability

1. **Multi-Provider Support**: Backup email services
2. **Geographic Optimization**: Regional email sending
3. **Advanced Segmentation**: Targeted email campaigns
4. **Machine Learning**: Personalization optimization

## Support

### Documentation

- **API Documentation**: `/api/user/email-preferences`
- **Component Documentation**: EmailPreferences.jsx
- **Service Documentation**: emailService.js

### Contact

For email setup issues:
1. Check SendGrid documentation
2. Review application logs
3. Test with debug mode enabled
4. Contact development team

---

## Quick Start Checklist

- [ ] Install SendGrid package
- [ ] Configure environment variables
- [ ] Set up SendGrid account and domain
- [ ] Run database migration
- [ ] Test email functionality
- [ ] Verify templates render correctly
- [ ] Monitor email delivery
- [ ] Update user preferences as needed

This email system significantly enhances user engagement by providing detailed, actionable wellness insights directly to users' inboxes while respecting their preferences and privacy.
