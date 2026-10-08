import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text, type TextColor } from './Text';
import { radius, space } from './tokens';

export interface BadgeProps {
  /** The text in the pill. Colour is never the only cue, so a badge always has text. */
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  /** Muted, for something that no longer applies. */
  disabled?: boolean;
  /** Placeholder pill while the value is loading. */
  loading?: boolean;
  /** Read out while loading. Pass a translated string. */
  loadingLabel?: string | undefined;
}

interface Look {
  background: keyof ThemeColors;
  text: TextColor;
}

const TONE: Record<NonNullable<BadgeProps['tone']>, Look> = {
  neutral: { background: 'muted', text: 'ink' },
  success: { background: 'successBg', text: 'success' },
  warning: { background: 'warningBg', text: 'warning' },
  danger: { background: 'dangerBg', text: 'danger' },
  info: { background: 'infoBg', text: 'info' },
};

const DISABLED: Look = { background: 'muted', text: 'inkMuted' };

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      paddingHorizontal: space[3],
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    placeholder: { width: 56, height: 20, borderRadius: radius.full, backgroundColor: c.line },
  });

export function Badge({
  label,
  tone = 'neutral',
  disabled = false,
  loading = false,
  loadingLabel,
}: BadgeProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const look = disabled ? DISABLED : TONE[tone];

  return (
    <View
      accessible={loading}
      aria-busy={loading}
      aria-label={loading ? loadingLabel : undefined}
      style={[styles.pill, { backgroundColor: colors[look.background] }]}
    >
      {loading ? (
        <View style={styles.placeholder} />
      ) : (
        <Text variant="strong" color={look.text}>
          {label}
        </Text>
      )}
    </View>
  );
}
