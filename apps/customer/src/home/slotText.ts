import type { MessageKey } from '@quibo/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import { windowParts, type DayPeriod, type Slot, type SlotDay } from './slots';

const PERIOD: Readonly<Record<DayPeriod, MessageKey>> = {
  morning: 'cart.periodMorning',
  afternoon: 'cart.periodAfternoon',
  evening: 'cart.periodEvening',
  night: 'cart.periodNight',
};

/** What follows the hours on a chip. English needs AM or PM; Hindi and Marathi say "बजे" or "वाजता" and leave the part of the day to the heading. */
const CHIP_PERIOD: Readonly<Record<DayPeriod, MessageKey>> = {
  morning: 'cart.chipAm',
  afternoon: 'cart.chipPm',
  evening: 'cart.chipPm',
  night: 'cart.chipPm',
};

const MONTHS: readonly MessageKey[] = [
  'product.months.jan',
  'product.months.feb',
  'product.months.mar',
  'product.months.apr',
  'product.months.may',
  'product.months.jun',
  'product.months.jul',
  'product.months.aug',
  'product.months.sep',
  'product.months.oct',
  'product.months.nov',
  'product.months.dec',
];

export interface SlotText {
  /** A window as words, for example "5–6 PM", "शाम 5–6" or "11 AM–12 PM". Hours are in Latin digits. Never minutes. */
  windowLabel: (hour: number) => string;
  /** A window for a chip under a heading that already names the part of the day, for example "5–6 PM" or "5–6 बजे". */
  chipLabel: (hour: number) => string;
  /** "Today" or "Tomorrow". */
  dayLabel: (day: SlotDay) => string;
  /** A day's date, for example "9 Oct". */
  dateLabel: (date: Date) => string;
  /** A window with its day, for example "Today, 5–6 PM". */
  dayWindow: (slot: Slot) => string;
  /** The line on the cart: "Arriving today, 5–6 PM". */
  arriving: (slot: Slot) => string;
}

/** The words for delivery windows and days, in the app's language. */
export function useSlotText(): SlotText {
  const { t } = useLanguage();

  const windowLabel = (hour: number) => {
    const parts = windowParts(hour);
    return parts.crossesNoon
      ? t('cart.windowCross', { from: parts.from, to: parts.to })
      : t('cart.windowSame', { from: parts.from, to: parts.to, period: t(PERIOD[parts.period]) });
  };
  const chipLabel = (hour: number) => {
    const parts = windowParts(hour);
    return parts.crossesNoon
      ? t('cart.chipCross', { from: parts.from, to: parts.to })
      : t('cart.chip', { from: parts.from, to: parts.to, period: t(CHIP_PERIOD[parts.period]) });
  };
  const dayLabel = (day: SlotDay) => t(day === 'today' ? 'cart.today' : 'cart.tomorrow');
  // A date and a day with its window are only numbers, names and a comma, so they are joined here, not in the messages.
  const dateLabel = (date: Date) =>
    `${date.getDate()} ${t(MONTHS[date.getMonth()] ?? 'product.months.jan')}`;

  return {
    windowLabel,
    chipLabel,
    dayLabel,
    dateLabel,
    dayWindow: (slot) => `${dayLabel(slot.day)}, ${windowLabel(slot.hour)}`,
    arriving: (slot) =>
      t(slot.day === 'today' ? 'cart.arrivingToday' : 'cart.arrivingTomorrow', {
        window: windowLabel(slot.hour),
      }),
  };
}
