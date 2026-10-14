import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { RowTitle, Text, space } from '@/ui';
import { anyCardNote, useHomeItems } from './items';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useViewed } from './useViewed';
import { viewedItems } from './viewed';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
    },
    title: { flex: 1, minWidth: 0 },
    clear: { minHeight: 48, justifyContent: 'center', paddingHorizontal: space[1] },
    clearText: { textDecorationLine: 'underline', textDecorationColor: c.ctl },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * "Continue browsing" (ADR 0055, step 7): the products the shopper opened last, newest first, in the usual card row, with a Clear
 * button. It is read from what the phone remembers opening (only product ids, nothing else), so it shows only what is real and is
 * not shown at all until something has been opened. An item that has gone or is out of stock is left out.
 */
export function ContinueBrowsing() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const items = useHomeItems();
  const viewed = useViewed();
  const list = viewedItems(viewed.ids, items);
  if (list.length === 0) return null;
  const note = anyCardNote(list);

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.title}>
          <RowTitle title={t('home.continue.title')} />
        </View>
        <Pressable
          role="button"
          aria-label={t('home.continue.clear')}
          onPress={viewed.clear}
          style={styles.clear}
        >
          <Text variant="strong" color="inkMuted" numberOfLines={1}>
            {t('home.continue.clear')}
          </Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {list.map((item) => (
            <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
