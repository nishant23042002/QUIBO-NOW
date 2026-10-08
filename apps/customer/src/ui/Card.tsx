import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { radius, space } from './tokens';

export interface CardProps {
  /** `error` is for a card whose content failed to load or is invalid. */
  tone?: 'default' | 'error';
  /** Look-only: muted, and nothing in it should be pressable. A card is not a control. */
  disabled?: boolean;
  /** Replace the content with a skeleton and announce busy. */
  loading?: boolean;
  /** Read out while loading. Pass a translated string. */
  loadingLabel?: string | undefined;
  children: ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: space[4],
      gap: space[3],
      borderWidth: 2,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    error: { borderColor: c.danger, backgroundColor: c.dangerBg },
    disabled: { backgroundColor: c.muted, opacity: 0.6 },
    skeleton: { gap: space[3] },
    bar: { borderRadius: radius.sm, backgroundColor: c.muted },
  });

export function Card({
  tone = 'default',
  disabled = false,
  loading = false,
  loadingLabel,
  children,
}: CardProps) {
  const styles = useStyles(makeStyles);

  return (
    <View
      accessible={loading}
      aria-busy={loading}
      aria-label={loading ? loadingLabel : undefined}
      style={[styles.card, tone === 'error' && styles.error, disabled && styles.disabled]}
    >
      {loading ? (
        <View style={styles.skeleton}>
          <View style={[styles.bar, { width: '66%', height: 20 }]} />
          <View style={[styles.bar, { width: '100%', height: 16 }]} />
          <View style={[styles.bar, { width: '83%', height: 16 }]} />
        </View>
      ) : (
        children
      )}
    </View>
  );
}
