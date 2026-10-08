import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

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
      backgroundColor: c.accentSubtle,
    },
  });

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
        <Icon name={icon} color={colors.accentInk} size={32} />
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
