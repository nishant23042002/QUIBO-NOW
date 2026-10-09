import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text, type TextColor } from './Text';
import { radius, space } from './tokens';

export interface NoticeProps {
  tone: 'info' | 'warning' | 'error';
  /** The message. Pass a translated string. */
  message: string;
  icon?: IconName;
  /** A text button at the end, for example "Try again". */
  actionLabel?: string;
  onAction?: () => void;
}

interface Look {
  background: keyof ThemeColors;
  text: TextColor;
}

const TONE: Record<NoticeProps['tone'], Look> = {
  info: { background: 'infoBg', text: 'info' },
  warning: { background: 'warningBg', text: 'warning' },
  error: { background: 'dangerBg', text: 'danger' },
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    box: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.md,
      borderWidth: 2,
    },
    message: { flex: 1, gap: space[2] },
    action: { minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start' },
    pressed: { opacity: 0.7 },
    // A notice is a banner, not a card: the border carries the same colour as the text.
    infoBorder: { borderColor: c.info },
    warningBorder: { borderColor: c.warning },
    errorBorder: { borderColor: c.danger },
  });

/** A banner for offline, error and information messages. Errors are announced as soon as they appear. */
export function Notice({ tone, message, icon, actionLabel, onAction }: NoticeProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const look = TONE[tone];
  const border =
    tone === 'error'
      ? styles.errorBorder
      : tone === 'warning'
        ? styles.warningBorder
        : styles.infoBorder;

  return (
    <View
      role={tone === 'error' ? 'alert' : 'status'}
      style={[styles.box, border, { backgroundColor: colors[look.background] }]}
    >
      {icon !== undefined ? <Icon name={icon} color={colors[look.text]} size={20} /> : null}
      <View style={styles.message}>
        <Text variant="small" color={look.text}>
          {message}
        </Text>
        {actionLabel !== undefined && onAction !== undefined ? (
          <Pressable
            role="button"
            onPress={onAction}
            hitSlop={6}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text variant="strong" color={look.text}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
