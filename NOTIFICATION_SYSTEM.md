# Notification System Documentation

## Overview

The notification system has been completely revamped to eliminate duplicate notifications and provide a more robust, user-friendly experience. Here's what's been improved:

## 🔧 **Issues Fixed**

### **1. Duplicate Notification Problem**
- **Problem**: Users received 2 notifications for journal creation (one from perspective session, one from manual journal)
- **Solution**: Added `hasRecentMilestoneNotification()` method that checks if a milestone notification was sent in the last 7 days
- **Result**: No more duplicate milestone notifications

### **2. Missing Notification Triggers**
- **Problem**: Mood tracking and perspective save-to-journal didn't trigger milestone checks
- **Solution**: Added `notificationService.checkMilestones()` calls to:
  - `POST /api/mood` - Now triggers mood tracking milestones
  - `POST /api/perspective/save-to-journal` - Now triggers journal milestones
- **Result**: All user actions now properly trigger relevant notifications

### **3. Scheduled Notifications Not Processing**
- **Problem**: Scheduled notifications were created but never sent
- **Solution**: Created `/api/notifications/process-scheduled` endpoint for cron jobs
- **Result**: Daily/weekly reminders now work automatically

## 📱 **Notification Types**

| Type | Purpose | When Triggered |
|------|---------|----------------|
| `milestone` | User achievements | When reaching goals (1st journal, 10 sessions, etc.) |
| `daily_reflection` | Daily reminder | Scheduled for 8 PM daily |
| `check_in` | Weekly reminder | Scheduled for 7 PM weekly |
| `tip` | Mindfulness tips | Manually or automatically generated |
| `achievement` | Special achievements | Custom achievements |
| `task_reminder` | Specific tasks | Custom scheduled tasks |
| `reminder` | General reminders | Custom reminders |

## 🏆 **Milestone System**

### **Perspective Session Milestones**
- **First Session**: "Welcome to Your Journey! 🌟"
- **5 Sessions/Week**: "Weekly Achievement Unlocked! 🎉"
- **10 Total Sessions**: "Double Digits! 🚀"
- **30-Day Streak**: "30-Day Streak! 🔥"

### **Journal Milestones**
- **First Journal**: "First Journal Entry! 📝"

### **Mood Tracking Milestones**
- **7 Days of Moods**: "Week of Mood Tracking! 📊"

### **Anti-Duplication Logic**
- Each milestone checks if the same notification was sent in the last 7 days
- Prevents duplicates from multiple triggers
- Ensures users only see each milestone once per week

## 🛠 **API Endpoints**

### **Core Notification APIs**
- `GET /api/notifications` - Fetch user notifications
- `POST /api/notifications` - Create custom notification
- `PUT /api/notifications/[id]` - Mark notification as read
- `DELETE /api/notifications/[id]` - Delete notification
- `PUT /api/notifications/bulk` - Bulk operations (mark all read)

### **Management APIs**
- `POST /api/notifications/generate` - Generate specific notifications
- `POST /api/notifications/setup` - Setup automatic reminders
- `GET /api/notifications/setup` - Get notification statistics
- `POST /api/notifications/process-scheduled` - Process scheduled notifications (cron job)

### **Setup API Actions**
```javascript
// Setup automatic reminders
POST /api/notifications/setup
{
  "action": "setup_reminders"
}

// Check milestones manually
POST /api/notifications/setup
{
  "action": "check_milestones"
}

// Create mindfulness tip
POST /api/notifications/setup
{
  "action": "create_mindfulness_tip"
}
```

## ⏰ **Scheduled Notifications**

### **Daily Reflection Reminder**
- **When**: 8 PM every day
- **Content**: "Daily Reflection Time 🌅 - Take a moment to reflect on your day..."
- **Condition**: Only if user has `wellness_reminders = true`

### **Weekly Check-in Reminder**
- **When**: 7 PM every week
- **Content**: "Weekly Check-in 📅 - How are you feeling this week..."
- **Condition**: Only if user has `weekly_summary = true`

### **Cron Job Setup**

You have two options for setting up notification processing:

#### **Option 1: Simple Scheduled Processing (Hourly)**
```bash
# Add to your crontab to run every hour
0 * * * * curl -X POST https://your-domain.com/api/notifications/process-scheduled -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### **Option 2: Complete Batch Processing (Recommended)**
```bash
# Add to your crontab to run every hour
0 * * * * curl -X POST https://your-domain.com/api/notifications/process-batch -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**What the batch processor does:**
- ✅ Processes all scheduled notifications that are due
- ✅ Sets up automatic daily/weekly reminders for active users
- ✅ Handles errors gracefully and provides detailed reporting

**Environment Variables needed:**
```bash
# Add to your .env file
CRON_SECRET=drishti-daily-summary-cron-secret-2024
```

**Similar to your daily summary cron job:**
- Daily summary: `POST /api/daily-summary/generate-batch` (runs daily at 11:59 PM)
- Notifications: `POST /api/notifications/process-batch` (runs every hour)
- Both use the same authentication method and environment variables

### **GitHub Actions Setup**

Your notification system now has GitHub Actions automation just like your daily summary:

**Daily Summary Workflow:**
- Runs: Daily at 11:59 PM (`59 23 * * *`)
- Action: Generates daily summaries for all active users

**Notifications Workflow:**
- Runs: Every hour at minute 0 (`0 * * * *`)
- Action: Processes scheduled notifications + sets up automatic reminders

**What Notifications Will Be Sent:**

#### **Daily Reflection Reminders (8 PM)**
- **Trigger**: Daily at 8 PM for users with `wellness_reminders = true`
- **Content**: "Daily Reflection Time 🌅 - Take a moment to reflect on your day..."
- **Users**: All active users who have wellness reminders enabled

#### **Weekly Summaries (Sundays)**
- **Trigger**: Every Sunday at 12:00 AM UTC via automated processing
- **Content**: "Your Weekly Summary is Ready! 📊 - Here's your personalized weekly insights..."
- **Data**: Analyzes entire week's daily summaries, journals, moods, and sessions
- **AI Analysis**: Google Gemini generates growth insights, themes, achievements, challenges
- **Users**: All active users with activity in the previous week

#### **Weekly Summary Processing Reminders (7 PM)**
- **Trigger**: Weekly reminder that summary is being processed
- **Content**: "Weekly Summary Processing 🔄 - We're analyzing your week's data..."
- **Users**: All active users who have weekly summary enabled

#### **Mindfulness Tips (As Available)**
- **Trigger**: Manually or can be automated
- **Content**: Random tips like breathing exercises, gratitude practice, etc.
- **Users**: Anyone who requests them or via automated campaigns

#### **Milestone Notifications (Real-time)**
- **Trigger**: When users reach achievements (1st journal, 10 sessions, etc.)
- **Content**: Achievement notifications with 🎉 emojis
- **Deduplication**: 7-day cooldown prevents duplicates

**Setup Required in GitHub Secrets:**
```bash
APP_URL=https://your-app.vercel.app
CRON_SECRET=your-secure-secret-key
```

## 🔧 **Notification Service Methods**

### **Core Methods**
```javascript
// Create notification
await notificationService.createNotification(userId, title, message, type, scheduledFor)

// Check and create milestones
await notificationService.checkMilestones(userId)

// Check for recent milestone (anti-duplication)
await notificationService.hasRecentMilestoneNotification(userId, title)

// Process scheduled notifications
await notificationService.processScheduledNotifications()
```

### **Reminder Methods**
```javascript
// Setup automatic reminders for user
await notificationService.setupAutomaticReminders(userId)

// Create daily reflection reminder
await notificationService.createDailyReflectionReminder(userId)

// Create weekly check-in reminder
await notificationService.createWeeklyCheckInReminder(userId)

// Create mindfulness tip
await notificationService.createMindfulnessTip(userId)
```

## 🎯 **Best Practices**

### **For Developers**
1. **Always call `checkMilestones()`** after user actions that might trigger milestones
2. **Use dynamic imports** for notificationService to avoid circular dependencies
3. **Handle notification errors gracefully** - never let notification errors break main functionality
4. **Use the setup API** for automatic reminder management

### **For Users**
1. **Enable wellness reminders** in user preferences for daily tips
2. **Check notifications regularly** for milestone achievements
3. **Customize notification timing** through user settings (future feature)

## 🔄 **Notification Flow**

```
User Action → Check Milestones → Anti-Duplication Check → Create Notification → Store in DB → Send to UI
```

1. User performs action (creates journal, tracks mood, etc.)
2. System checks if any milestones are reached
3. For each milestone, checks if notification was sent recently
4. Creates notification only if not duplicated
5. Stores notification in database
6. UI fetches and displays notifications

## 🚀 **Future Enhancements**

### **Planned Features**
- **Push Notifications**: Real-time mobile notifications
- **Notification Preferences**: User-customizable notification types and timing
- **Smart Scheduling**: AI-powered optimal notification times
- **Notification Groups**: Group related notifications together
- **Snooze Functionality**: Allow users to snooze notifications

### **Performance Optimizations**
- **Batch Processing**: Process notifications in batches for better performance
- **Caching**: Cache notification data to reduce database queries
- **Background Jobs**: Move notification processing to background workers

## 🐛 **Troubleshooting**

### **Common Issues**

**Q: Why am I not receiving milestone notifications?**
A: Check if the milestone was already reached in the last 7 days (anti-duplication)

**Q: Why are scheduled notifications not being sent?**
A: Ensure the cron job is properly configured and running

**Q: Why do I see duplicate notifications?**
A: This shouldn't happen with the new system. Check if different notification types are being triggered

### **Debug Commands**
```javascript
// Check user's notification stats
GET /api/notifications/setup

// Manually trigger milestone check
POST /api/notifications/setup { "action": "check_milestones" }

// Process scheduled notifications manually
POST /api/notifications/process-scheduled
```

## 📊 **Monitoring**

### **Key Metrics to Track**
- **Notification Delivery Rate**: Percentage of notifications successfully delivered
- **User Engagement Rate**: Percentage of notifications read/acted upon
- **Milestone Completion Rate**: Percentage of users reaching milestones
- **Duplicate Rate**: Should be 0% with new system

### **Database Queries for Monitoring**
```sql
-- Check for duplicate milestone notifications (should be empty)
SELECT title, COUNT(*) as count 
FROM notifications 
WHERE type = 'milestone' 
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY title 
HAVING count > 1;

-- Check scheduled notifications not processed
SELECT COUNT(*) as pending_count
FROM notifications 
WHERE scheduled_for <= NOW() 
  AND sent_at IS NULL;

-- Notification engagement by type
SELECT type, 
       COUNT(*) as total,
       SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as read_count,
       ROUND(SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as read_rate
FROM notifications 
GROUP BY type;
```

This improved notification system provides a much better user experience with no duplicates, comprehensive coverage of all user actions, and reliable scheduled notifications.
