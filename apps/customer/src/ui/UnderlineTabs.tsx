import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { TAP_MIN, space } from './tokens';

export interface UnderlineTab {
  key: string;
  /** Already translated. */
  label: string;
}

export interface UnderlineTabsProps {
  tabs: readonly UnderlineTab[];
  selectedKey: string;
  onSelect: (key: string) => void;
  /** Names the row for a screen reader. */
  label: string;
}

const UNDERLINE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: space[5], paddingHorizontal: space[4] },
    tab: { minHeight: TAP_MIN, justifyContent: 'center' },
    underline: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space[1],
      height: UNDERLINE,
      borderRadius: UNDERLINE,
      backgroundColor: c.action,
    },
    line: { height: 1, backgroundColor: c.line },
    pressed: { opacity: 0.8 },
  });

/**
 * A row of text tabs with a bar under the chosen one, over one fine line: for a module that offers a few views of the same things
 * without leaving the page (Trending in Roha). It scrolls sideways when the tabs do not fit, and every tab keeps a 48 dp touch height.
 */
export function UnderlineTabs({ tabs, selectedKey, onSelect, label }: UnderlineTabsProps) {
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
              onPress={() => {
                onSelect(tab.key);
              }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <Text variant="label" color={selected ? 'ink' : 'inkMuted'} numberOfLines={1}>
                {tab.label}
              </Text>
              {selected ? <View style={styles.underline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.line} aria-hidden />
    </View>
  );
}
