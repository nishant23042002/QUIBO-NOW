import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface TrustTile {
  key: string;
  icon: IconName;
  /** For example "Verified shop". */
  title: string;
  /** One short line under it, for example "Checked by Quibo". */
  body: string;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    tile: {
      flexGrow: 1,
      flexBasis: '47%',
      gap: space[1],
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: c.accentSubtle,
    },
    icon: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.surface,
    },
  });

/** Four short promises in a two-by-two grid, each with an icon: who checked the shop, where it is packed, when it arrives and what happens if it is not right. */
export function TrustTiles({ tiles }: { tiles: readonly TrustTile[] }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {tiles.map((tile) => (
        <View
          key={tile.key}
          style={styles.tile}
          accessible
          aria-label={`${tile.title}. ${tile.body}`}
        >
          <View style={styles.icon}>
            <Icon name={tile.icon} color={colors.accentInk} size={20} />
          </View>
          <Text variant="strong">{tile.title}</Text>
          <Text variant="small" color="inkMuted">
            {tile.body}
          </Text>
        </View>
      ))}
    </View>
  );
}
