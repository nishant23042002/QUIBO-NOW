import { StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface LetteredTitleProps {
  /** The big word, for example "Fresh". */
  word: string;
  /** The word on the sticker, for example "today". */
  sticker: string;
  /** A line under it, for example "Handpicked daily essentials from your kirana". */
  sub?: string;
  /** No side padding, for a title already inside a block that has its own. */
  flush?: boolean;
}

/** The depth of the sticker's stamped edge, as on the price badge. */
const EDGE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { gap: space[1], paddingHorizontal: space[4] },
    flush: { paddingHorizontal: 0 },
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space[2] },
    sticker: {
      paddingHorizontal: space[2],
      paddingVertical: 1,
      borderRadius: radius.md,
      backgroundColor: c.accent,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
      borderColor: c.accentEdge,
      transform: [{ rotate: '-3deg' }],
      marginRight: EDGE,
    },
  });

/**
 * The title of a module that has a name of its own (Fresh today, Small prices): a big word and a sticker beside it, with the
 * price badge's stamped edge, so the lettering carries the app's signature without a new font. The sub line is quieter.
 */
export function LetteredTitle({ word, sticker, sub, flush = false }: LetteredTitleProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={[styles.wrap, flush && styles.flush]}>
      <View style={styles.row}>
        <Text variant="title" numberOfLines={1}>
          {word}
        </Text>
        <View style={styles.sticker}>
          <Text variant="heading" color="onAccent" numberOfLines={1}>
            {sticker}
          </Text>
        </View>
      </View>
      {sub !== undefined ? (
        <Text variant="small" color="inkMuted" numberOfLines={2}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
