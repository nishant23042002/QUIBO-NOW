import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, fontSize, radius, space } from './tokens';

export interface SearchBarProps {
  /** The hint inside the bar. Pass a translated string. */
  placeholder: string;
  /** Give a handler and the bar is a button that opens the search screen. */
  onPress?: () => void;
  /** Give these and the bar is a real text field. */
  value?: string;
  onChangeText?: (text: string) => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    bar: {
      minHeight: TAP_MIN,
      paddingHorizontal: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      borderRadius: radius.md,
      backgroundColor: c.surface,
    },
    input: { flex: 1, paddingVertical: space[2], fontSize: fontSize.base, color: c.ink },
    hint: { flex: 1 },
  });

/** The search bar at the top of home and of a shop. It sits on the dark header, so it is always a light field. */
export function SearchBar({ placeholder, onPress, value, onChangeText }: SearchBarProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const icon = <Icon name="search" color={colors.inkMuted} size={20} />;

  if (onChangeText !== undefined) {
    return (
      <View style={styles.bar}>
        {icon}
        <TextInput
          role="searchbox"
          aria-label={placeholder}
          placeholder={placeholder}
          placeholderTextColor={colors.inkMuted}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />
      </View>
    );
  }

  return (
    <Pressable role="button" aria-label={placeholder} onPress={onPress} style={styles.bar}>
      {icon}
      <View style={styles.hint}>
        <Text color="inkMuted" numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
    </Pressable>
  );
}
