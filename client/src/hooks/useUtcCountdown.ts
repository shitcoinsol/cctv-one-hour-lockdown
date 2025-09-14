import { useState, useEffect, useRef } from 'react';
import { getNextTargetDate, isRecurringMode } from '../config/schedule';
import { getRemainingTime } from '../utils/time';
import { getPhaseFromRemaining, type Phase, type PhaseInfo } from '../state/phases';
import { getUnsealState, type UnsealState } from '../state/unseal';
import { getAppConfig } from '../config/env';

export interface CountdownState {
  remainingMs: number;
  h: number;
  m: number;
  s: number;
  phase: Phase;
  phaseInfo: PhaseInfo;
  isUnsealed: boolean;
  justUnsealed: boolean;
  shouldShowFeedGrid: boolean;
  targetDate: Date;
  isConfigValid: boolean;
}

export function useUtcCountdown(): CountdownState {
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [targetDate, setTargetDate] = useState<Date>(() => {
    try {
      return getNextTargetDate();
    } catch {
      return new Date(); // fallback date
    }
  });
  
  const [state, setState] = useState<CountdownState>(() => {
    const config = getAppConfig();
    if (!config) {
      return {
        remainingMs: 0,
        h: 0,
        m: 0,
        s: 0,
        phase: 'A' as Phase,
        phaseInfo: {
          phase: 'A' as Phase,
          name: 'Configuration Error',
          description: 'Invalid configuration',
          shouldPauseLogs: true,
          shouldInvertDigits: false
        },
        isUnsealed: false,
        justUnsealed: false,
        shouldShowFeedGrid: false,
        targetDate: new Date(),
        isConfigValid: false
      };
    }
    
    const remaining = getRemainingTime(targetDate);
    const phaseInfo = getPhaseFromRemaining(remaining.totalMs / 1000);
    const unsealState = getUnsealState(targetDate);
    
    return {
      remainingMs: remaining.totalMs,
      h: remaining.hours,
      m: remaining.minutes,
      s: remaining.seconds,
      phase: phaseInfo.phase,
      phaseInfo,
      isUnsealed: unsealState.isUnsealed,
      justUnsealed: unsealState.justUnsealed,
      shouldShowFeedGrid: unsealState.shouldShowFeedGrid,
      targetDate,
      isConfigValid: true
    };
  });

  const intervalRef = useRef<number>();

  const updateCountdown = () => {
    const config = getAppConfig();
    if (!config) {
      setIsConfigValid(false);
      return;
    }
    
    setIsConfigValid(true);
    const now = new Date();
    
    try {
      const unsealState = getUnsealState(targetDate, now);
      
      // Handle recurring mode rollover
      if (isRecurringMode() && unsealState.nextTargetDate) {
        setTargetDate(unsealState.nextTargetDate);
        return;
      }
      
      const remaining = getRemainingTime(targetDate);
      const phaseInfo = getPhaseFromRemaining(remaining.totalMs / 1000);
      
      setState({
        remainingMs: remaining.totalMs,
        h: remaining.hours,
        m: remaining.minutes,
        s: remaining.seconds,
        phase: phaseInfo.phase,
        phaseInfo,
        isUnsealed: unsealState.isUnsealed,
        justUnsealed: unsealState.justUnsealed,
        shouldShowFeedGrid: unsealState.shouldShowFeedGrid,
        targetDate,
        isConfigValid: true
      });
    } catch (error) {
      // If any error occurs during countdown update, mark as invalid
      setIsConfigValid(false);
    }
  };

  useEffect(() => {
    // Update immediately
    updateCountdown();
    
    // Set up interval
    intervalRef.current = window.setInterval(updateCountdown, 250);

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateCountdown();
      }
    };

    // Handle window focus
    const handleFocus = () => {
      updateCountdown();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [targetDate]);

  return state;
}
