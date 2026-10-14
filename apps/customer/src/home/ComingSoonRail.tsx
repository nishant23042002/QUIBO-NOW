import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';
import type { GroupView } from './useCategoryGroups';
import { useNotify } from './useNotify';

/** A card's size, shared with the loading skeleton so nothing moves when the cards arrive. */
export const SOON_CARD_WIDTH = 172;
export const SOON_CARD_HEIGHT = 132;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    card: {
      width: SOON_CARD_WIDTH,
      minHeight: SOON_CARD_HEIGHT,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      padding: space[3],
      gap: space[2],
      justifyContent: 'space-between',
    },
    cardOn: { borderColor: c.accent, borderWidth: 1.5, backgroundColor: c.accentSubtle },
    pictures: { flexDirection: 'row', gap: space[1] },
    name: { minHeight: 44 },
    action: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.action,
      paddingHorizontal: space[2],
    },
    actionOn: { borderColor: c.accentEdge, backgroundColor: c.accent },
    pressed: { opacity: 0.85 },
  });

/**
 * "Coming soon to Roha" cards (ADR 0053, ADR 0055): one for each group that is only coming (beauty, tech, home and style, pharmacy,
 * what is only on Quibo), a few pictures, its name and a Notify me button. A tap on the card turns Notify me on and off; it is kept
 * on the phone in Phase 1 and sent to the API in Phase 2. Pharmacy and Only on Quibo are placeholders, never catalogues.
 */
export function ComingSoonRail({ groups }: { groups: readonly GroupView[] }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const notify = useNotify();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {groups.map((group) => {
          const on = group.notified;
          return (
            <Pressable
              key={group.id}
              role="button"
              aria-pressed={on}
              aria-label={`${group.title}. ${on ? t('catalogue.notify.hintOn') : t('catalogue.notify.hint')}`}
              onPress={() => {
                notify.toggle(group.notifyId);
              }}
              style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && styles.pressed]}
            >
              <View style={styles.pictures} aria-hidden>
                {group.emojis.map((emoji) => (
                  <NativeText
                    key={emoji}
                    allowFontScaling={false}
                    style={{ fontSize: 26, lineHeight: 34 }}
                  >
                    {emoji}
                  </NativeText>
                ))}
              </View>
              <View style={styles.name}>
                <Text variant="label" numberOfLines={2} maxFontSizeMultiplier={1.3}>
                  {group.title}
                </Text>
              </View>
              <View style={[styles.action, on && styles.actionOn]} aria-hidden>
                {on ? <Icon name="check" color={colors.onAccent} size={14} /> : null}
                <Text variant="strong" color={on ? 'onAccent' : 'action'} numberOfLines={1}>
                  {on ? t('catalogue.notify.on') : t('catalogue.notify.me')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
