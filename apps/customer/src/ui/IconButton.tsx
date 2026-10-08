import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { TAP_MIN } from './tokens';

export interface IconButtonProps {
  icon: IconName;
  /** What a screen reader says. Pass a translated string. */
  label: string;
  onPress: () => void;
  /** "chrome" for the dark header, "page" for the page itself. */
  ground?: 'chrome' | 'page';
}

const CIRCLE = 38;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    hit: { width: TAP_MIN, height: TAP_MIN, alignItems: 'center', justifyContent: 'center' },
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chrome: { borderColor: c.onChrome },
    page: { borderColor: c.ctl },
    pressed: { opacity: 0.7 },
  });

/** A round icon button with a full-size touch target. */
export function IconButton({ icon, label, onPress, ground = 'chrome' }: IconButtonProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const iconColor = ground === 'chrome' ? colors.onChrome : colors.ink;

  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <View style={[styles.circle, ground === 'chrome' ? styles.chrome : styles.page]}>
        <Icon name={icon} color={iconColor} size={18} />
      </View>
    </Pressable>
  );
}
