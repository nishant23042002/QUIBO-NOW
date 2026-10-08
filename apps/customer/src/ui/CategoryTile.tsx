import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { initialOf } from './logic/initial';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface CategoryTileProps {
  /** The name in the current language. */
  name: string;
  /** The same name in the other script, shown small underneath. */
  otherName?: string;
  onPress: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tile: { flex: 1, minWidth: 0, alignItems: 'center', gap: space[1] },
    box: {
      width: '100%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.8 },
    label: { maxWidth: '100%', alignItems: 'center' },
  });

/** One category in the grid on home. The picture is a placeholder until real artwork exists. */
export function CategoryTile({ name, otherName, onPress }: CategoryTileProps) {
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="button"
      aria-label={name}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.box}>
        <Text variant="heading" color="inkMuted">
          {initialOf(name)}
        </Text>
      </View>
      <View style={styles.label}>
        <Text variant="strong" numberOfLines={1}>
          {name}
        </Text>
        {otherName !== undefined ? (
          <Text variant="small" color="inkMuted" numberOfLines={1}>
            {otherName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
