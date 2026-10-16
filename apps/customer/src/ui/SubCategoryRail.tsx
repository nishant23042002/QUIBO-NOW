import { Pressable, ScrollView, StyleSheet, Text as NativeText, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface SubCategoryRailItem {
  /** `null` is the "All" entry. */
  id: string | null;
  label: string;
  emoji: string;
}

export interface SubCategoryRailProps {
  items: readonly SubCategoryRailItem[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** Names the list for a screen reader, for example "Kinds in this category". */
  label: string;
  /** The colour of the chosen entry's bar and ring, for a screen with a colour of its own. Defaults to the theme's action colour. */
  accent?: string;
}

/** How wide the rail is, shared with the loading skeleton so the page does not shift when it arrives. */
export const SUB_RAIL_WIDTH = 80;
/** The round picture's size, shared with the loading skeleton. */
export const SUB_RAIL_CIRCLE = 48;
const CIRCLE = SUB_RAIL_CIRCLE;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // No colour of its own: it sits on whatever the page under it shows, so the rail and the grid read as one surface.
    rail: { width: SUB_RAIL_WIDTH },
    list: { paddingVertical: space[2] },
    item: {
      alignItems: 'center',
      gap: space[1],
      paddingVertical: space[2],
      paddingHorizontal: 2,
      minHeight: 48,
    },
    // The chosen entry has a bar down the rail's left edge, the way the page reads it at a glance.
    bar: {
      position: 'absolute',
      left: 0,
      top: space[2],
      bottom: space[2],
      width: 4,
      borderTopRightRadius: radius.sm,
      borderBottomRightRadius: radius.sm,
      backgroundColor: c.action,
    },
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    circleOn: { borderWidth: 2, borderColor: c.action },
    pressed: { opacity: 0.8 },
  });

/**
 * The category screen's left-hand list of kinds: "All", then each sub-category as a round picture with its name under it. It scrolls
 * on its own, beside the products.
 */
export function SubCategoryRail({
  items,
  selected,
  onSelect,
  label,
  accent,
}: SubCategoryRailProps) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.rail}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        aria-label={label}
      >
        {items.map((entry) => {
          const on = entry.id === selected;
          return (
            <Pressable
              key={entry.id ?? 'all'}
              role="button"
              aria-label={entry.label}
              aria-pressed={on}
              onPress={() => {
                onSelect(entry.id);
              }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              {on ? (
                <View style={[styles.bar, accent !== undefined && { backgroundColor: accent }]} />
              ) : null}
              <View
                style={[
                  styles.circle,
                  on && styles.circleOn,
                  on && accent !== undefined && { borderColor: accent },
                ]}
                aria-hidden
              >
                <NativeText allowFontScaling={false} style={{ fontSize: 24, lineHeight: 32 }}>
                  {entry.emoji}
                </NativeText>
              </View>
              <Text
                variant="caption"
                align="center"
                color={on ? 'ink' : 'inkMuted'}
                numberOfLines={3}
                maxFontSizeMultiplier={1.2}
              >
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
