// State Machine رزرو — دو نقطه انسانی: review و disputed
export const TRANSITIONS = {
  initiated:        ['held', 'cancelled'],
  held:             ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['review', 'confirmed', 'cancelled'],
  review:           ['confirmed', 'cancelled'],      // نقطه انسانی ۱: پرداخت
  confirmed:        ['checked_in', 'cancelled', 'disputed'],
  checked_in:       ['completed', 'disputed'],
  disputed:         ['confirmed', 'cancelled'],      // نقطه انسانی ۲: اختلاف
  completed:        [],
  cancelled:        [],
} as const;

export type State = keyof typeof TRANSITIONS;

export function can(from: State, to: State): boolean {
  return (TRANSITIONS[from] as readonly string[]).includes(to);
}

export function assertTransition(from: State, to: State) {
  if (!can(from, to)) throw new Error(`Invalid transition ${from} -> ${to}`);
}
