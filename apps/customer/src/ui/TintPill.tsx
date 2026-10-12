import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface TintPillProps {
  /** The words in the pill. Pass a translated string. */
  label: string;
  /** A small icon before the words, for example "check" or "clock". */
  icon?: IconName;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingHorizontal: space[2],
      paddingVertical: 2,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.accentInk,
      backgroundColor: c.accentSubtle,
    },
  });

/**
 * One small green-tinted pill, the same tint as the product page's View details button: for the few things that are good to know
 * about the item (the delivery time, that it was packed today, that other shops have it too). It is deliberately the only pill
 * style, so green means "worth a look" and nothing else; the pistachio fill belongs to the price badge alone.
 */
export function TintPill({ label, icon }: TintPillProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.pill}>
      {icon !== undefined ? <Icon name={icon} color={colors.accentInk} size={14} /> : null}
      <Text variant="caption" color="accentInk" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
