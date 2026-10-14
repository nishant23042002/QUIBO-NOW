import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface IconTab {
  key: string;
  /** Already translated. */
  label: string;
  /** The round picture: one emoji. */
  emoji?: string;
  /** Or a short word on a stamped sticker instead of a picture, for example a price. */
  sticker?: string;
}

export interface IconTabsProps {
  tabs: readonly IconTab[];
  selectedKey: string;
  onSelect: (key: string) => void;
  /** Names the row for a screen reader. */
  label: string;
}

const CIRCLE = 56;
const EDGE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: space[1], paddingHorizontal: space[3] },
    tab: { width: 76, alignItems: 'center', gap: space[1], paddingTop: space[1] },
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.lilac,
    },
    stamp: {
      width: CIRCLE - 4,
      height: CIRCLE - 4,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
      borderColor: c.accentEdge,
      marginBottom: space[1],
    },
    name: { width: '100%', paddingBottom: space[2], alignItems: 'center' },
    underline: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 3,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      backgroundColor: c.action,
    },
    line: { height: 1, backgroundColor: c.line },
    pressed: { opacity: 0.8 },
  });

/**
 * A row of round picture tabs with a name under each and an underline under the chosen one, over one fine line: the way a module
 * offers a few related shelves without leaving the page (Zepto's and Blinkit's own tab rails). A tab can carry a stamped sticker
 * instead of a picture. It scrolls sideways when the tabs do not fit.
 */
export function IconTabs({ tabs, selectedKey, onSelect, label }: IconTabsProps) {
  const styles = useStyles(makeStyles);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        role="tablist"
        aria-label={label}
      >
        {tabs.map((tab) => {
          const selected = tab.key === selectedKey;
          return (
            <Pressable
              key={tab.key}
              role="tab"
              aria-selected={selected}
              aria-label={tab.label}
              onPress={() => {
                onSelect(tab.key);
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              {tab.sticker !== undefined ? (
                <View style={styles.stamp} aria-hidden>
                  <Text
                    variant="label"
                    color="onAccent"
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.2}
                  >
                    {tab.sticker}
                  </Text>
                </View>
              ) : (
                <View style={styles.circle} aria-hidden>
                  <NativeText allowFontScaling={false} style={{ fontSize: 28, lineHeight: 36 }}>
                    {tab.emoji ?? ''}
                  </NativeText>
                </View>
              )}
              <View style={styles.name}>
                <Text
                  variant="caption"
                  color={selected ? 'ink' : 'inkMuted'}
                  align="center"
                  numberOfLines={2}
                  maxFontSizeMultiplier={1.2}
                >
                  {tab.label}
                </Text>
                {selected ? <View style={styles.underline} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.line} aria-hidden />
    </View>
  );
}
