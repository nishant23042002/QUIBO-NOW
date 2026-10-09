import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface SlotChipData {
  id: string;
  /** The window, for example "5–6 PM". Never minutes. */
  label: string;
  /** A small line under it, for example the delivery fee for that window. */
  caption?: string;
  /** `good` draws the caption in the success colour, to point out the cheapest windows. */
  captionTone?: 'normal' | 'good';
  state: 'idle' | 'selected' | 'full';
}

export interface SlotGroupData {
  key: string;
  /** For example "Evening". */
  label: string;
  icon: IconName;
  slots: readonly SlotChipData[];
}

export interface SlotDayTab {
  key: string;
  /** For example "Today". */
  label: string;
  /** Under it, for example "9 Oct · 11 slots". */
  sub: string;
}

export interface SlotPickerProps {
  days: readonly SlotDayTab[];
  activeDay: string;
  onDay: (key: string) => void;
  groups: readonly SlotGroupData[];
  onSelect: (id: string) => void;
  /** Read out for a full window, for example "full". Pass a translated string. */
  fullLabel: string;
  /** Shown instead of the groups when the day has no windows left. */
  emptyLabel: string;
}

const COLUMNS = 3;
const GAP = space[2];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.line },
    tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
    // The line under the chosen day: one line that slides from tab to tab.
    indicator: { position: 'absolute', left: 0, bottom: -1, height: 2, backgroundColor: c.action },
    body: { gap: space[4], paddingTop: space[4] },
    group: { gap: space[2] },
    groupHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    chip: {
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[1],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    selected: { borderColor: c.action, backgroundColor: c.accentSubtle },
    full: { borderColor: c.line, backgroundColor: c.muted },
    pressed: { opacity: 0.8 },
    empty: { paddingVertical: space[6], alignItems: 'center' },
  });

/** One window. When it becomes the chosen one it gives a small pop, so the choice is acknowledged. */
function SlotChip({
  slot,
  width,
  fullLabel,
  onSelect,
}: {
  slot: SlotChipData;
  width: number | undefined;
  fullLabel: string;
  onSelect: (id: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const was = useRef(slot.state);
  const full = slot.state === 'full';
  const selected = slot.state === 'selected';

  useEffect(() => {
    const before = was.current;
    was.current = slot.state;
    if (slot.state !== 'selected' || before === 'selected' || reduceMotion) return undefined;
    scale.setValue(0.9);
    const spring = Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 220,
      useNativeDriver: true,
    });
    spring.start();
    return () => {
      spring.stop();
    };
  }, [slot.state, reduceMotion, scale]);

  return (
    <Animated.View style={[width !== undefined && { width }, { transform: [{ scale }] }]}>
      <Pressable
        role="radio"
        aria-checked={selected}
        aria-disabled={full}
        aria-label={full ? `${slot.label}, ${fullLabel}` : slot.label}
        disabled={full}
        onPress={() => {
          onSelect(slot.id);
        }}
        style={({ pressed }) => [
          styles.chip,
          selected && styles.selected,
          full && styles.full,
          pressed && !full && styles.pressed,
        ]}
      >
        <Text
          // A long label ("11 AM–12 PM") takes the smaller size, so it fits the chip whole instead of being cut.
          variant={slot.label.length > 9 ? 'caption' : 'strong'}
          color={full ? 'inkMuted' : 'ink'}
          strike={full}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.875}
        >
          {slot.label}
        </Text>
        {full ? (
          <Text variant="caption" color="inkMuted">
            {fullLabel}
          </Text>
        ) : slot.caption !== undefined ? (
          <Text variant="caption" color={slot.captionTone === 'good' ? 'success' : 'inkMuted'}>
            {slot.caption}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Two day tabs (today and tomorrow) over the delivery windows of the chosen day, grouped by morning, afternoon and
 * evening, three to a row. The line under the chosen day slides to the other tab when the day changes. A window can
 * carry a small caption such as its delivery fee; a full window stays visible but struck through and cannot be chosen,
 * and says so to screen readers. When a day has nothing left, it says so.
 */
export function SlotPicker({
  days,
  activeDay,
  onDay,
  groups,
  onSelect,
  fullLabel,
  emptyLabel,
}: SlotPickerProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  const [tabsWidth, setTabsWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    days.findIndex((day) => day.key === activeDay),
  );
  const [at] = useState(() => new Animated.Value(activeIndex));
  // Three equal chips in a row, measured, so the last one in a row never wraps by a rounding error.
  const chipWidth = width > 0 ? Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS) : undefined;
  const tabWidth = days.length > 0 ? tabsWidth / days.length : 0;

  useEffect(() => {
    if (reduceMotion) {
      at.setValue(activeIndex);
      return undefined;
    }
    const slide = Animated.timing(at, {
      toValue: activeIndex,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    slide.start();
    return () => {
      slide.stop();
    };
  }, [activeIndex, reduceMotion, at]);

  return (
    <View>
      <View
        style={styles.tabs}
        role="tablist"
        onLayout={(event) => {
          setTabsWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        {days.map((day) => {
          const active = day.key === activeDay;
          return (
            <Pressable
              key={day.key}
              role="tab"
              aria-selected={active}
              onPress={() => {
                onDay(day.key);
              }}
              style={styles.tab}
            >
              <Text variant="label" color={active ? 'ink' : 'inkMuted'}>
                {day.label}
              </Text>
              <Text variant="caption" color="inkMuted">
                {day.sub}
              </Text>
            </Pressable>
          );
        })}
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            aria-hidden
            style={[
              styles.indicator,
              {
                width: tabWidth,
                transform: [{ translateX: Animated.multiply(at, tabWidth) }],
              },
            ]}
          />
        ) : null}
      </View>
      <View
        style={styles.body}
        onLayout={(event) => {
          setWidth(Math.round(event.nativeEvent.layout.width));
        }}
      >
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Text color="inkMuted" align="center">
              {emptyLabel}
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.key} style={styles.group} role="radiogroup" aria-label={group.label}>
              <View style={styles.groupHead}>
                <Icon name={group.icon} color={colors.inkMuted} size={16} />
                <Text variant="caption" color="inkMuted">
                  {group.label}
                </Text>
              </View>
              <View style={styles.grid}>
                {group.slots.map((slot) => (
                  <SlotChip
                    key={slot.id}
                    slot={slot}
                    width={chipWidth}
                    fullLabel={fullLabel}
                    onSelect={onSelect}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
