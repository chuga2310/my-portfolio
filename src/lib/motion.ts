import type { Transition } from 'motion/react';

/** Shared easing for enter animations (fast start, long soft landing). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Active pills that glide between items (nav, tabs, language). */
export const PILL_SPRING: Transition = { type: 'spring', stiffness: 420, damping: 34 };

/** Cards and decks settling into a new slot. */
export const CARD_SPRING: Transition = { type: 'spring', stiffness: 260, damping: 30 };
