// Setup type definitions for built-in Supabase Runtime APIs
import dayjs from 'dayjs';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  Habit,
  HabitCompletion,
  UserWithHabitsBasic,
} from '../_shared/types.ts';
import {
  getTemplates,
  isNextHourTargetAlt,
  selectRandomTemplate,
} from '../_shared/utils.ts';

// Local notification data interface (more restrictive than shared one)
interface LocalNotificationData {
  user_id: string;
  title: string;
  body: string;
  notification_type: 'MORNING' | 'EVENING';
  scheduled_for: string;
  processed: boolean;
}

export function prepareNotifications(
  usersWithData: UserWithHabitsBasic[],
  morningHour: number,
  eveningHour: number
): LocalNotificationData[] {
  const scheduledNotifications: LocalNotificationData[] = [];

  for (const user of usersWithData) {
    const isMorningNext = isNextHourTargetAlt(user.timezone, morningHour);
    const isEveningNext = isNextHourTargetAlt(user.timezone, eveningHour);

    if (!isMorningNext && !isEveningNext) {
      continue; // Skip if next hour isn't a target hour
    }

    const scheduledTime = dayjs()
      .tz(user.timezone || 'UTC')
      .add(1, 'hour')
      .hour(isMorningNext ? morningHour : eveningHour)
      .minute(0)
      .second(0)
      .millisecond(0);

    if (isMorningNext) {
      // Morning notification - get templates based on whether user has habits
      const subsection =
        user.habits.length === 0 ? 'morning.noHabits' : 'morning.hasHabits';
      const templates = getTemplates(
        user.preferred_language,
        'dailyUpdate',
        subsection
      );
      const template = selectRandomTemplate(templates);

      scheduledNotifications.push({
        user_id: user.id,
        title: template.title,
        body: template.body,
        notification_type: 'MORNING',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
      });
    } else if (isEveningNext && user.habits.length > 0) {
      // Evening notification (only for users with habits)
      const completedHabits = user.habits.filter(
        (habit: Habit & { completions: HabitCompletion[] }) =>
          habit.completions.some(
            (c: HabitCompletion) => c.status === 'completed'
          )
      );

      const completionRate =
        (completedHabits.length / user.habits.length) * 100;

      // Determine which evening template category to use
      let subsection: string;
      if (completionRate === 100) {
        subsection = 'evening.complete';
      } else if (completionRate >= 50) {
        subsection = 'evening.mediumProgress';
      } else if (completionRate > 0) {
        subsection = 'evening.lowProgress';
      } else {
        subsection = 'evening.noProgress';
      }

      const templates = getTemplates(
        user.preferred_language,
        'dailyUpdate',
        subsection
      );
      const template = selectRandomTemplate(templates);

      // Replace placeholders with actual values
      const body = template.body
        .replace(/{count}/g, completedHabits.length.toString())
        .replace(/{total}/g, user.habits.length.toString())
        .replace(
          /{remaining}/g,
          (user.habits.length - completedHabits.length).toString()
        );

      scheduledNotifications.push({
        user_id: user.id,
        title: template.title,
        body: body,
        notification_type: 'EVENING',
        scheduled_for: scheduledTime.toISOString(),
        processed: false,
      });
    }
  }

  return scheduledNotifications;
}
