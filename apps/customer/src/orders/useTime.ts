import { useSlotText } from '@/home/slotText';
import { useLanguage } from '@/i18n/LanguageProvider';
import { clockParts } from './tracking';

/** A time of day on a 12-hour clock, for example "10:02 AM". Hindi and Marathi follow it with "बजे" or "वाजता". */
export function useTimeLabel(): (date: Date) => string {
  const { t } = useLanguage();
  return (date) => {
    const { hour, minutes, morning } = clockParts(date);
    return `${hour}:${minutes} ${t(morning ? 'cart.chipAm' : 'cart.chipPm')}`;
  };
}

/** A day and a time, for example "9 Oct, 12:11 AM", in the app's language. */
export function useDateTimeLabel(): (date: Date) => string {
  const slotText = useSlotText();
  const time = useTimeLabel();
  return (date) => `${slotText.dateLabel(date)}, ${time(date)}`;
}
