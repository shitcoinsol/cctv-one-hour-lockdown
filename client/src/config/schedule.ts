import { getValidatedAppConfig } from './env';
import { parseIsoUtc, parseIsoUtcSafe } from '../utils/time';

export function getNextTargetDate(): Date {
  const appConfig = getValidatedAppConfig();
  
  // One-shot mode
  if (appConfig.targetUtcIso) {
    const targetDate = parseIsoUtcSafe(appConfig.targetUtcIso);
    if (!targetDate) {
      throw new Error(`Invalid target date: ${appConfig.targetUtcIso}`);
    }
    return targetDate;
  }

  const now = new Date();
  
  // Daily recurring mode
  if (appConfig.scheduleMode === 'daily' && appConfig.dailyUtc) {
    const [hours, minutes, seconds] = appConfig.dailyUtc.split(':').map(Number);
    
    const today = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      seconds
    ));
    
    // If today's time has passed, schedule for tomorrow
    if (today.getTime() <= now.getTime()) {
      today.setUTCDate(today.getUTCDate() + 1);
    }
    
    return today;
  }

  // Weekly recurring mode
  if (appConfig.scheduleMode === 'weekly' && appConfig.weeklyUtc) {
    const [dayStr, timeStr] = appConfig.weeklyUtc.split('-');
    const targetDay = parseInt(dayStr, 10); // 0=Sunday, 1=Monday, etc.
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    
    const currentDay = now.getUTCDay();
    let daysUntilTarget = targetDay - currentDay;
    
    // If the target day is today, check if the time has passed
    if (daysUntilTarget === 0) {
      const todayTarget = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        seconds
      ));
      
      if (todayTarget.getTime() > now.getTime()) {
        return todayTarget;
      } else {
        daysUntilTarget = 7; // Next week
      }
    }
    
    // If target day is in the past this week, schedule for next week
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilTarget,
      hours,
      minutes,
      seconds
    ));
    
    return targetDate;
  }

  throw new Error('Invalid schedule configuration');
}

export function isRecurringMode(): boolean {
  const appConfig = getValidatedAppConfig();
  return !appConfig.targetUtcIso && (appConfig.scheduleMode === 'daily' || appConfig.scheduleMode === 'weekly');
}
