import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { TAP_MIN, fontSize, radius, space } from './tokens';

export interface InputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  /** Visible label. Required: placeholder text is not a label. */
  label: string;
  /** Help text under the field. */
  hint?: string | undefined;
  /** Error message. It replaces the hint and is read out as soon as it appears. */
  error?: string | undefined;
  /** Busy (for example checking a value on the server): shows a spinner and announces busy. */
  loading?: boolean;
  disabled?: boolean;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    field: { gap: space[2] },
    input: {
      minHeight: TAP_MIN,
      paddingHorizontal: space[4],
      paddingVertical: space[2],
      borderWidth: 2,
      borderRadius: radius.md,
      backgroundColor: c.surface,
      color: c.ink,
      fontSize: fontSize.base,
    },
    withSpinner: { paddingRight: space[12] },
    disabled: { backgroundColor: c.muted, color: c.inkMuted },
    spinner: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: space[4],
      justifyContent: 'center',
      pointerEvents: 'none',
    },
  });

export function Input({
  label,
  hint,
  error,
  loading = false,
  disabled = false,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = disabled
    ? 'transparent'
    : error !== undefined
      ? colors.danger
      : focused
        ? colors.action
        : colors.ctl;

  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <View>
        <TextInput
          aria-label={label}
          aria-busy={loading}
          placeholderTextColor={colors.inkMuted}
          {...rest}
          editable={!disabled}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            loading && styles.withSpinner,
            disabled && styles.disabled,
            { borderColor },
          ]}
        />
        {loading ? (
          <View style={styles.spinner}>
            <ActivityIndicator color={colors.inkMuted} />
          </View>
        ) : null}
      </View>
      {error !== undefined ? (
        <Text variant="strong" color="danger" role="alert">
          {error}
        </Text>
      ) : hint !== undefined ? (
        <Text variant="small" color="inkMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
