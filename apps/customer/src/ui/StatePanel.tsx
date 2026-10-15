import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { textLines } from './logic/textLines';
import { Skeleton, SkeletonLine } from './Skeleton';
import { Text } from './Text';
import { TAP_MIN, fontSize, radius, space } from './tokens';

export interface StatePanelProps {
  icon: IconName;
  /** For example "You are offline". */
  title: string;
  /** One or two plain sentences on what happened and what to do. */
  body: string;
  /** The button's text, for example "Try again". Leave out when there is nothing to press. */
  actionLabel?: string;
  onAction?: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    panel: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[3],
      padding: space[6],
    },
    circle: {
      width: 72,
      height: 72,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.lilac,
    },
  });

/**
 * A whole-page message while its page loads: the circle, the title's line, the two lines of the sentence and the button, in the
 * panel's own box and gaps, for a page that is going to say "nothing here yet". Put it inside a `SkeletonScope`.
 */
export function StatePanelSkeleton({
  body,
  action = true,
}: {
  /** The sentence the panel will say, so the skeleton draws the lines it will wrap to. Two lines when it is not given. */
  body?: string;
  action?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const { locale } = useLanguage();
  const { width: screen } = useWindowDimensions();
  const lines =
    body === undefined
      ? 2
      : textLines(
          body,
          screen - space[6] * 2,
          fontSize.base,
          locale === 'en' ? 'latin' : 'devanagari',
        );

  return (
    <View style={styles.panel}>
      <Skeleton width={72} height={72} rounded={radius.full} />
      <SkeletonLine size="xl" tight width={180} align="center" />
      <View style={{ width: '100%' }}>
        {Array.from({ length: lines }, (_, line) => (
          <SkeletonLine
            key={line}
            size="base"
            width={line === lines - 1 && lines > 1 ? '55%' : '80%'}
            align="center"
          />
        ))}
      </View>
      {action ? <Skeleton width={160} height={TAP_MIN} rounded={radius.md} /> : null}
    </View>
  );
}

/**
 * A whole-page message for when there is nothing to show: no network, a failed load, or something that does not
 * exist. An icon, a title, a sentence or two, and one button to try again or go back.
 */
export function StatePanel({ icon, title, body, actionLabel, onAction }: StatePanelProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.panel} role="alert">
      <View style={styles.circle} aria-hidden>
        <Icon name={icon} color={colors.action} size={32} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color="inkMuted" align="center">
        {body}
      </Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
