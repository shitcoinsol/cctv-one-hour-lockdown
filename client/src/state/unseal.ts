import { getNextTargetDate, isRecurringMode } from '../config/schedule';
import { getValidatedAppConfig } from '../config/env';

export interface UnsealState {
  isUnsealed: boolean;
  justUnsealed: boolean;
  shouldShowFeedGrid: boolean;
  nextTargetDate?: Date;
  timeRemaining?: number;
}

export function getUnsealState(targetDate: Date, currentTime: Date = new Date()): UnsealState {
  const timeRemaining = targetDate.getTime() - currentTime.getTime();
  const isUnsealed = timeRemaining <= 0;
  
  if (!isUnsealed) {
    return {
      isUnsealed: false,
      justUnsealed: false,
      shouldShowFeedGrid: false,
      timeRemaining
    };
  }

  // For one-shot mode, stay unsealed indefinitely
  if (!isRecurringMode()) {
    return {
      isUnsealed: true,
      justUnsealed: Math.abs(timeRemaining) < 3000, // Just unsealed if within 3 seconds
      shouldShowFeedGrid: true,
      timeRemaining: 0
    };
  }

  // For recurring mode, check if we're within the display window
  const timeSinceUnseal = Math.abs(timeRemaining);
  const appConfig = getValidatedAppConfig();
  const displayWindowMs = appConfig.displayWindowSeconds * 1000;
  
  if (timeSinceUnseal <= displayWindowMs) {
    return {
      isUnsealed: true,
      justUnsealed: timeSinceUnseal < 3000,
      shouldShowFeedGrid: true,
      timeRemaining: 0
    };
  }

  // Time to roll over to next occurrence
  const nextTarget = getNextTargetDate();
  const nextTimeRemaining = nextTarget.getTime() - currentTime.getTime();
  
  return {
    isUnsealed: false,
    justUnsealed: false,
    shouldShowFeedGrid: false,
    nextTargetDate: nextTarget,
    timeRemaining: nextTimeRemaining
  };
}
