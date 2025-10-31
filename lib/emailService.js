// Email Service for Drishti App
// This service handles sending detailed email summaries alongside notifications

class EmailService {
  constructor() {
    this.isConfigured = false;
    this.initializeEmailProvider();
  }

  async initializeEmailProvider() {
    try {
      // Check if SendGrid is available and configured
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = await import('@sendgrid/mail');
        this.sendgrid = sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.provider = 'sendgrid';
        this.isConfigured = true;
      } else {
        console.warn('Email service not configured. Please set SENDGRID_API_KEY environment variable.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('Failed to initialize email provider:', error);
      this.isConfigured = false;
    }
  }

  // Get user's email preferences
  async getUserEmailPreferences(userId) {
    try {
      const { prisma } = await import('./prisma');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true,
          email_preferences: true
        }
      });
      return user || { email: null, email_preferences: {} };
    } catch (error) {
      console.error('Error fetching user email preferences:', error);
      return { email: null, email_preferences: {} };
    }
  }

  // Check if user has opted in for specific email type
  shouldSendEmail(preferences, emailType) {
    if (!preferences) return false;
    
    const emailPrefs = preferences.email_preferences || {};
    return emailPrefs[emailType] !== false && emailPrefs.enabled !== false;
  }

  // Send weekly summary email
  async sendWeeklySummaryEmail(userId, weeklySummary) {
    try {
      if (!this.isConfigured) {
        console.log('Email service not configured, skipping weekly summary email');
        return { success: false, reason: 'Email service not configured' };
      }

      const user = await this.getUserEmailPreferences(userId);
      if (!user.email || !this.shouldSendEmail(user, 'weekly_summary')) {
        console.log(`User ${userId} not opted in for weekly summary emails or no email found`);
        return { success: false, reason: 'User not opted in' };
      }

      const emailContent = this.generateWeeklySummaryEmailContent(weeklySummary);
      
      const result = await this.sendEmail({
        to: user.email,
        subject: `Your Weekly Wellness Summary - ${this.formatDateRange(weeklySummary.week_start, weeklySummary.week_end)}`,
        ...emailContent
      });

      return result;
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send monthly summary email
  async sendMonthlySummaryEmail(userId, monthlySummary) {
    try {
      if (!this.isConfigured) {
        console.log('Email service not configured, skipping monthly summary email');
        return { success: false, reason: 'Email service not configured' };
      }

      const user = await this.getUserEmailPreferences(userId);
      if (!user.email || !this.shouldSendEmail(user, 'monthly_summary')) {
        console.log(`User ${userId} not opted in for monthly summary emails or no email found`);
        return { success: false, reason: 'User not opted in' };
      }

      const emailContent = this.generateMonthlySummaryEmailContent(monthlySummary);
      
      const result = await this.sendEmail({
        to: user.email,
        subject: `Your Monthly Wellness Report - ${this.formatMonthYear(monthlySummary.month, monthlySummary.year)}`,
        ...emailContent
      });

      return result;
    } catch (error) {
      console.error('Error sending monthly summary email:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate weekly summary email content
  generateWeeklySummaryEmailContent(weeklySummary) {
    const insights = weeklySummary.growth_insights || [];
    const achievements = weeklySummary.achievement_highlights || [];
    const challenges = weeklySummary.challenges_faced || [];
    const recommendations = weeklySummary.recommendations || [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Wellness Summary</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h3 { color: #667eea; margin-top: 0; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .stat-number { font-size: 2em; font-weight: bold; }
          .stat-label { font-size: 0.9em; opacity: 0.9; }
          .list-item { padding: 8px 0; border-bottom: 1px solid #eee; }
          .list-item:last-child { border-bottom: none; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Your Weekly Wellness Summary</h1>
            <p>${this.formatDateRange(weeklySummary.week_start, weeklySummary.week_end)}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>📊 Your Week at a Glance</h3>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-number">${weeklySummary.total_mood_entries || 0}</div>
                  <div class="stat-label">Mood Check-ins</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${weeklySummary.total_journals || 0}</div>
                  <div class="stat-label">Journal Entries</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${weeklySummary.total_perspective_sessions || 0}</div>
                  <div class="stat-label">Perspective Sessions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${weeklySummary.avg_mood_rate ? Math.round(weeklySummary.avg_mood_rate) : 'N/A'}</div>
                  <div class="stat-label">Avg Mood Score</div>
                </div>
              </div>
            </div>

            ${weeklySummary.avg_mood_emoji ? `
            <div class="section">
              <h3>😊 Your Dominant Mood</h3>
              <p style="font-size: 3em; text-align: center; margin: 20px 0;">${weeklySummary.avg_mood_emoji}</p>
              <p style="text-align: center;">This mood represents your overall emotional state this week.</p>
            </div>
            ` : ''}

            ${insights.length > 0 ? `
            <div class="section">
              <h3>💡 Growth Insights</h3>
              ${insights.map(insight => `<div class="list-item"><span class="emoji">✨</span> ${insight}</div>`).join('')}
            </div>
            ` : ''}

            ${achievements.length > 0 ? `
            <div class="section">
              <h3>🏆 Achievement Highlights</h3>
              ${achievements.map(achievement => `<div class="list-item"><span class="emoji">🎯</span> ${achievement}</div>`).join('')}
            </div>
            ` : ''}

            ${challenges.length > 0 ? `
            <div class="section">
              <h3>🎯 Challenges & Growth Areas</h3>
              ${challenges.map(challenge => `<div class="list-item"><span class="emoji">💪</span> ${challenge}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.length > 0 ? `
            <div class="section">
              <h3>📝 Recommendations for Next Week</h3>
              ${recommendations.map(rec => `<div class="list-item"><span class="emoji">🌱</span> ${rec}</div>`).join('')}
            </div>
            ` : ''}

            ${weeklySummary.detailed_summary ? `
            <div class="section">
              <h3>📖 Detailed Summary</h3>
              <p>${weeklySummary.detailed_summary}</p>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>Keep up the great work! 🌟</p>
            <p style="font-size: 0.9em; margin-top: 10px;">
              Want to adjust your email preferences? 
              <a href="#" style="color: #667eea; text-decoration: none;">Update your settings</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Your Weekly Wellness Summary
${this.formatDateRange(weeklySummary.week_start, weeklySummary.week_end)}

📊 Your Week at a Glance:
• Mood Check-ins: ${weeklySummary.total_mood_entries || 0}
• Journal Entries: ${weeklySummary.total_journals || 0}
• Perspective Sessions: ${weeklySummary.total_perspective_sessions || 0}
• Avg Mood Score: ${weeklySummary.avg_mood_rate ? Math.round(weeklySummary.avg_mood_rate) : 'N/A'}

${weeklySummary.avg_mood_emoji ? `😊 Your Dominant Mood: ${weeklySummary.avg_mood_emoji}` : ''}

${insights.length > 0 ? `
💡 Growth Insights:
${insights.map(insight => `• ${insight}`).join('\n')}
` : ''}

${achievements.length > 0 ? `
🏆 Achievement Highlights:
${achievements.map(achievement => `• ${achievement}`).join('\n')}
` : ''}

${challenges.length > 0 ? `
🎯 Challenges & Growth Areas:
${challenges.map(challenge => `• ${challenge}`).join('\n')}
` : ''}

${recommendations.length > 0 ? `
📝 Recommendations for Next Week:
${recommendations.map(rec => `• ${rec}`).join('\n')}
` : ''}

${weeklySummary.detailed_summary ? `
📖 Detailed Summary:
${weeklySummary.detailed_summary}
` : ''}

Keep up the great work! 🌟
`;

    return {
      html: htmlContent,
      text: textContent
    };
  }

  // Generate monthly summary email content
  generateMonthlySummaryEmailContent(monthlySummary) {
    const insights = monthlySummary.growth_insights || [];
    const achievements = monthlySummary.achievement_highlights || [];
    const challenges = monthlySummary.challenges_faced || [];
    const recommendations = monthlySummary.recommendations || [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Monthly Wellness Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .section { background: white; margin: 20px 0; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h3 { color: #f5576c; margin-top: 0; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .stat-number { font-size: 2em; font-weight: bold; }
          .stat-label { font-size: 0.9em; opacity: 0.9; }
          .list-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .list-item:last-child { border-bottom: none; }
          .footer { background: #333; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; }
          .emoji { font-size: 1.2em; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #f5576c; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Monthly Wellness Report</h1>
            <p>${this.formatMonthYear(monthlySummary.month, monthlySummary.year)}</p>
            <p style="font-size: 1.1em; margin-top: 10px;">A comprehensive look at your wellness journey</p>
          </div>
          
          <div class="content">
            <div class="highlight">
              <strong>🌟 Month in Review:</strong> ${monthlySummary.short_summary || 'Another month of growth and self-discovery!'}
            </div>

            <div class="section">
              <h3>📈 Your Monthly Stats</h3>
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.total_mood_entries || 0}</div>
                  <div class="stat-label">Mood Check-ins</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.total_journals || 0}</div>
                  <div class="stat-label">Journal Entries</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.total_perspective_sessions || 0}</div>
                  <div class="stat-label">Perspective Sessions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.total_weekly_summaries || 0}</div>
                  <div class="stat-label">Weekly Summaries</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.avg_mood_rate ? Math.round(monthlySummary.avg_mood_rate) : 'N/A'}</div>
                  <div class="stat-label">Avg Mood Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${monthlySummary.overall_wellness_score ? Math.round(monthlySummary.overall_wellness_score) : 'N/A'}</div>
                  <div class="stat-label">Wellness Score</div>
                </div>
              </div>
            </div>

            ${monthlySummary.avg_mood_emoji ? `
            <div class="section">
              <h3>😊 Your Emotional Theme</h3>
              <p style="font-size: 4em; text-align: center; margin: 25px 0;">${monthlySummary.avg_mood_emoji}</p>
              <p style="text-align: center; font-size: 1.1em;">This emoji represents your dominant emotional state this month.</p>
            </div>
            ` : ''}

            ${monthlySummary.dominant_theme ? `
            <div class="section">
              <h3>🎯 Dominant Theme</h3>
              <p style="font-size: 1.1em; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                "${monthlySummary.dominant_theme}"
              </p>
            </div>
            ` : ''}

            ${insights.length > 0 ? `
            <div class="section">
              <h3>💡 Key Growth Insights</h3>
              ${insights.map(insight => `<div class="list-item"><span class="emoji">🌱</span> ${insight}</div>`).join('')}
            </div>
            ` : ''}

            ${achievements.length > 0 ? `
            <div class="section">
              <h3>🏆 Major Achievements</h3>
              ${achievements.map(achievement => `<div class="list-item"><span class="emoji">🎉</span> ${achievement}</div>`).join('')}
            </div>
            ` : ''}

            ${challenges.length > 0 ? `
            <div class="section">
              <h3>💪 Challenges Overcome</h3>
              ${challenges.map(challenge => `<div class="list-item"><span class="emoji">🔥</span> ${challenge}</div>`).join('')}
            </div>
            ` : ''}

            ${recommendations.length > 0 ? `
            <div class="section">
              <h3>🎯 Recommendations for Next Month</h3>
              ${recommendations.map(rec => `<div class="list-item"><span class="emoji">✨</span> ${rec}</div>`).join('')}
            </div>
            ` : ''}

            ${monthlySummary.detailed_summary ? `
            <div class="section">
              <h3>📖 In-Depth Analysis</h3>
              <p>${monthlySummary.detailed_summary}</p>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p style="font-size: 1.1em; margin-bottom: 15px;">🎉 Congratulations on another month of wellness! 🎉</p>
            <p style="font-size: 0.9em;">
              Want to adjust your email preferences? 
              <a href="#" style="color: #f093fb; text-decoration: none;">Update your settings</a>
            </p>
            <p style="font-size: 0.8em; margin-top: 20px; opacity: 0.8;">
              This monthly report helps you track your progress and celebrate your growth journey.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Your Monthly Wellness Report
${this.formatMonthYear(monthlySummary.month, monthlySummary.year)}

🌟 Month in Review: ${monthlySummary.short_summary || 'Another month of growth and self-discovery!'}

📈 Your Monthly Stats:
• Mood Check-ins: ${monthlySummary.total_mood_entries || 0}
• Journal Entries: ${monthlySummary.total_journals || 0}
• Perspective Sessions: ${monthlySummary.total_perspective_sessions || 0}
• Weekly Summaries: ${monthlySummary.total_weekly_summaries || 0}
• Avg Mood Score: ${monthlySummary.avg_mood_rate ? Math.round(monthlySummary.avg_mood_rate) : 'N/A'}
• Wellness Score: ${monthlySummary.overall_wellness_score ? Math.round(monthlySummary.overall_wellness_score) : 'N/A'}

${monthlySummary.avg_mood_emoji ? `😊 Your Emotional Theme: ${monthlySummary.avg_mood_emoji}` : ''}

${monthlySummary.dominant_theme ? `
🎯 Dominant Theme:
"${monthlySummary.dominant_theme}"
` : ''}

${insights.length > 0 ? `
💡 Key Growth Insights:
${insights.map(insight => `• ${insight}`).join('\n')}
` : ''}

${achievements.length > 0 ? `
🏆 Major Achievements:
${achievements.map(achievement => `• ${achievement}`).join('\n')}
` : ''}

${challenges.length > 0 ? `
💪 Challenges Overcome:
${challenges.map(challenge => `• ${challenge}`).join('\n')}
` : ''}

${recommendations.length > 0 ? `
🎯 Recommendations for Next Month:
${recommendations.map(rec => `• ${rec}`).join('\n')}
` : ''}

${monthlySummary.detailed_summary ? `
📖 In-Depth Analysis:
${monthlySummary.detailed_summary}
` : ''}

🎉 Congratulations on another month of wellness! 🎉
`;

    return {
      html: htmlContent,
      text: textContent
    };
  }

  // Send email using the configured provider
  async sendEmail({ to, subject, html, text }) {
    try {
      if (this.provider === 'sendgrid') {
        const msg = {
          to: to,
          from: process.env.SENDGRID_FROM_EMAIL || 'notifications@drishti-app.com',
          subject: subject,
          text: text,
          html: html,
        };
        
        const result = await this.sendgrid.send(msg);
        return { success: true, provider: 'sendgrid', result };
      }
      
      return { success: false, error: 'No email provider configured' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility functions
  formatDateRange(startDate, endDate) {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  }

  formatMonthYear(month, year) {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}

const emailService = new EmailService();
export default emailService;
