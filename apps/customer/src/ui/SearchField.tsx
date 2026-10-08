import type { Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { fontSize, radius, space } from './tokens';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  /** The keyboard's search key. */
  onSubmit: () => void;
  /** Hint inside the empty field, and the field's name for a screen reader. Pass a translated string. */
  placeholder: string;
  /** The name of the clear button for a screen reader. */
  clearLabel: string;
  inputRef?: Ref<TextInput>;
}

const HEIGHT = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    field: {
      flex: 1,
      height: HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingLeft: space[3],
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
    input: {
      flex: 1,
      minWidth: 0,
      height: HEIGHT,
      padding: 0,
      color: c.ink,
      fontSize: fontSize.base,
    },
    clear: { width: HEIGHT, height: HEIGHT, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.6 },
  });

/** The search box of the search screen: a rounded field with a magnifier, a clear button once there is text, and the keyboard's search key. */
export function SearchField({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  clearLabel,
  inputRef,
}: SearchFieldProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Icon name="search" color={colors.inkMuted} size={20} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        aria-label={placeholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        maxFontSizeMultiplier={2}
        selectionColor={colors.action}
        style={styles.input}
      />
      {value !== '' ? (
        <Pressable
          role="button"
          aria-label={clearLabel}
          onPress={() => {
            onChangeText('');
          }}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
        >
          <Icon name="close" color={colors.inkMuted} size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}
