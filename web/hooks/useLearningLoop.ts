import { useState, useCallback, useRef, useEffect } from 'react';
import type { Season, ContentItem } from './useSeasonalContent';

export type Step = 'hear' | 'pause' | 'see' | 'repeat' | 'connect';

const STEP_ORDER: Step[] = ['hear', 'pause', 'see', 'repeat', 'connect'];

// Timing per season (milliseconds)
const TIMING: Record<Season, Record<Step, number>> = {
  winter: { hear: 5000, pause: 4000, see: 0, repeat: 0, connect: 0 },   // stories: longer listen
  spring: { hear: 3000, pause: 2000, see: 0, repeat: 0, connect: 0 },   // words: quick cycle
  summer: { hear: 2500, pause: 1500, see: 0, repeat: 0, connect: 0 },   // practice: fast
  fall:   { hear: 4000, pause: 3000, see: 0, repeat: 0, connect: 0 },   // meaning: reflective
};
// see/repeat/connect = 0 means user-triggered (no auto-advance)

export interface LearningLoopState {
  step: Step;
  stepIndex: number;
  itemIndex: number;
  item: ContentItem | null;
  isAutoAdvancing: boolean;
}

export function useLearningLoop(items: ContentItem[], season: Season) {
  const [step, setStep] = useState<Step>('hear');
  const [itemIndex, setItemIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = items[itemIndex] || null;
  const stepIndex = STEP_ORDER.indexOf(step);
  const timing = TIMING[season];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Auto-advance for timed steps (hear, pause)
  useEffect(() => {
    clearTimer();
    const duration = timing[step];
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        advanceStep();
      }, duration);
    }
    return clearTimer;
  }, [step, itemIndex]);

  const advanceStep = useCallback(() => {
    clearTimer();
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [step, clearTimer]);

  const nextItem = useCallback(() => {
    clearTimer();
    setStep('hear');
    setItemIndex(prev => (prev + 1) % items.length);
  }, [items.length, clearTimer]);

  const jumpToItem = useCallback((item: ContentItem) => {
    // Find item in pool or just reset to hear step
    const idx = items.findIndex(i => i.id === item.id);
    clearTimer();
    setStep('hear');
    if (idx >= 0) {
      setItemIndex(idx);
    }
  }, [items, clearTimer]);

  const skipStep = useCallback(() => {
    advanceStep();
  }, [advanceStep]);

  return {
    step,
    stepIndex,
    item,
    itemIndex,
    totalItems: items.length,
    advanceStep,
    nextItem,
    jumpToItem,
    skipStep,
    isAutoStep: timing[step] > 0,
  };
}
