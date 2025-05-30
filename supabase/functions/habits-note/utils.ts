// Setup type definitions for built-in Supabase Runtime APIs
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { NotificationData, UserWithHabitsBasic } from '../_shared/types.ts';
import {
  getTemplates,
  selectRandomTemplate,
  setupDayjs,
} from '../_shared/utils.ts';

// Configure dayjs with UTC and timezone plugins
setupDayjs();

export function prepareNotifications(
  usersWithHabits: UserWithHabitsBasic[]
): NotificationData[] {
  const notifications: NotificationData[] = [];

  for (const user of usersWithHabits) {
    // Get next hour in user's timezone
    const userNextHour = dayjs()
      .tz(user.timezone || 'UTC')
      .add(1, 'hour')
      .hour();

    for (const habit of user.habits) {
      if (!habit.reminder_time) continue;

      // Parse reminder time
      const reminderHour = parseInt(habit.reminder_time.split(':')[0]);
      const reminderMinute = parseInt(habit.reminder_time.split(':')[1]);

      if (reminderHour !== userNextHour) continue;

      // Check if habit is already completed today
      const isCompleted = habit.completions.some(
        (completion) => completion.status === 'completed'
      );

      if (isCompleted) {
        console.log('Habit already completed, skipping notification:', {
          habitId: habit.id,
          habitName: habit.name,
        });
        continue;
      }
      // Create scheduled time for next hour
      const scheduledTime = dayjs()
        .tz(user.timezone || 'UTC')
        .add(1, 'hour')
        .minute(reminderMinute)
        .second(0)
        .millisecond(0);

      // Get templates in user's preferred language
      const templates = getTemplates(user.preferred_language, 'habits');
      const template = selectRandomTemplate(templates);

      // Replace habit name in template
      const title = template.title.replace(/{habit}/g, habit.name);
      const body = template.body.replace(/{habit}/g, habit.name);

      console.log('Creating notification:', {
        userId: user.id,
        habitId: habit.id,
        habitName: habit.name,
        scheduledFor: scheduledTime.toISOString(),
        title,
        body,
      });

      notifications.push({
        user_id: user.id,
        habit_id: habit.id,
        title,
        body,
        notification_type: 'HABIT',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
        data: {
          habit_id: habit.id,
          color: '#4F46E5', // Default color
          icon: '🎯', // Default icon
        },
      });
    }
  }

  return notifications;
}
