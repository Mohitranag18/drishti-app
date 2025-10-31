# 🚀 Deployment Guide: Email Service Environment Variables

## Required Environment Variables

Your email service requires these environment variables:

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
```

## Setup Instructions

### 1. Vercel (Required for Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables:
   - **Name**: `SENDGRID_API_KEY`
   - **Value**: Your SendGrid API key
   - **Environments**: Production, Preview, Development

   - **Name**: `SENDGRID_FROM_EMAIL` 
   - **Value**: Your verified SendGrid sender email
   - **Environments**: Production, Preview, Development

4. Click **Save**
5. **Redeploy** your application to apply changes

### 2. GitHub (Optional but Recommended)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `SENDGRID_API_KEY`
   - **Secret**: Your SendGrid API key
   - **Name**: `SENDGRID_FROM_EMAIL`
   - **Secret**: Your verified SendGrid email

## SendGrid Setup Requirements

### 1. Verify Your Sender Email
1. Log in to [SendGrid Dashboard](https://app.sendgrid.com)
2. Go to **Settings** → **Sender Authentication**
3. **Verify** your sender email address
4. Wait for verification confirmation

### 2. API Key Permissions
Your SendGrid API key should have these permissions:
- **Mail Send**: `Full Access` or `Restricted Access` with send permissions
- **Template Access**: If using email templates

## Testing Your Setup

### 1. Test Email Functionality
```bash
# Test email endpoint
curl -X POST https://your-app.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type": "weekly"}'
```

### 2. Check Email Settings Page
- Navigate to `/email-settings` in your app
- Verify your email address appears
- Test toggling email preferences
- Click "Save Preferences" to confirm API works

## Common Issues & Solutions

### ❌ "Email service not configured"
**Cause**: Missing SENDGRID_API_KEY
**Solution**: Add API key to Vercel environment variables

### ❌ "From address not verified"  
**Cause**: SENDGRID_FROM_EMAIL not verified in SendGrid
**Solution**: Verify sender email in SendGrid dashboard

### ❌ "API key invalid"
**Cause**: Incorrect API key or insufficient permissions
**Solution**: Regenerate API key with proper permissions

### ❌ "Module not found" errors
**Cause**: Build issues (should be resolved now)
**Solution**: Check that all components are properly imported

## Production Deployment Checklist

- [ ] SENDGRID_API_KEY added to Vercel environment variables
- [ ] SENDGRID_FROM_EMAIL added to Vercel environment variables  
- [ ] Sender email verified in SendGrid dashboard
- [ ] API key has proper permissions
- [ ] Application redeployed after adding variables
- [ ] Test email sent successfully
- [ ] Email preferences page working correctly

## Security Notes

🔒 **Never commit environment variables to Git**
- Use `.env.local` for local development only
- `.env` should only contain non-sensitive defaults
- Always use environment-specific variable management

🔒 **API Key Best Practices**
- Use restrictive API key permissions
- Regenerate keys periodically
- Monitor SendGrid usage and analytics
- Set up sending domain verification for better deliverability

## Troubleshooting

If emails still don't work after deployment:

1. **Check Vercel Function Logs**:
   - Vercel dashboard → Functions → Logs
   - Look for email service errors

2. **Verify SendGrid Integration**:
   - Test with SendGrid's API documentation
   - Check email sending limits and quotas

3. **Database Connection**:
   - Ensure email preferences are saved correctly
   - Check user email addresses are valid

4. **Email Deliverability**:
   - Check spam folders
   - Verify sender reputation
   - Use authenticated domain for better deliverability

---

## 🎯 Your Current Status

✅ **Email Service**: Fully implemented and tested
✅ **Build Issues**: All resolved  
✅ **API Endpoints**: Working correctly
✅ **Templates**: Professional and responsive
✅ **User Interface**: Email settings page functional

**Next Step**: Add environment variables to Vercel and redeploy! 🚀
