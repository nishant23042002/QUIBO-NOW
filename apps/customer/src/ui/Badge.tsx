import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, radius, space, type ColorName } from './tokens';

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

const TONE = {
  neutral: { background: 'surfaceMuted', text: 'ink' },
  success: { background: 'successSubtle', text: 'success' },
  warning: { background: 'warningSubtle', text: 'warning' },
  danger: { background: 'dangerSubtle', text: 'danger' },
  info: { background: 'infoSubtle', text: 'info' },
} as const satisfies Record<string, { background: ColorName; text: ColorName }>;

export function Badge({
  label,
  tone = 'neutral',
  disabled = false,
  loading = false,
  loadingLabel,
}: BadgeProps) {
  const look: { background: ColorName; text: ColorName } = disabled
    ? { background: 'surfaceMuted', text: 'inkMuted' }
    : TONE[tone];

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

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[3],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  placeholder: { width: 56, height: 20, borderRadius: radius.full, backgroundColor: colors.line },
});
