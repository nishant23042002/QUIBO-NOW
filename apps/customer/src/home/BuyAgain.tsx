import { formatRupees, money } from '@quibo/contracts';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOrders } from '@/orders/OrdersProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  AccentWash,
  Button,
  LetteredTitle,
  SegmentedTabs,
  Text,
  WEIGHT_RULE,
  countRule,
  radius,
  space,
  stepQuantity,
} from '@/ui';
import { againItems, againPackIds, type AgainTab } from './againRules';
import { useCart, useCartActions } from './CartProvider';
import { essentialBasket } from './essentials';
import { anyCardNote, useHomeItems } from './items';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    // On a pistachio wash with a curved top and a fine edge, as Fresh today is.
    module: {
      paddingTop: space[5],
      paddingBottom: space[5],
      gap: space[3],
      borderTopLeftRadius: radius.section,
      borderTopRightRadius: radius.section,
      overflow: 'hidden',
    },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
  });

/**
 * "Buy again" (ADR 0055, step 7): what the customer has bought before, from the orders the phone keeps, at today's prices. Two
 * views: the last order, and what they order most. An item that is out of stock today is named under the row instead of being
 * quietly missing, and "Add all" puts one of each thing that can be bought into the cart. A customer who has not ordered sees
 * nothing here. The cards are the usual item cards.
 */
export function BuyAgain() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { loaded, orders } = useOrders();
  const items = useHomeItems();
  const cart = useCart();
  const { setQuantity } = useCartActions();
  const [tab, setTab] = useState<AgainTab>('last');

  const source = orders.map((entry) => ({
    status: entry.order.status,
    items: entry.order.items,
  }));
  const list = againItems(againPackIds(source, tab), items);
  if (!loaded || list.length === 0) return null;

  const buyable = list.filter((item) => item.stock?.kind !== 'out');
  const outOfStock = list.filter((item) => item.stock?.kind === 'out');
  // One more of each thing that can be bought and is not already in the cart.
  const toAdd = buyable.filter((item) => (cart.quantities[item.defaultPackId] ?? 0) === 0);
  const basket = essentialBasket(toAdd, new Set(toAdd.map((item) => item.id)));
  const note = anyCardNote(list);

  const addAll = () => {
    for (const item of toAdd) {
      const rule = item.loose === true ? WEIGHT_RULE : countRule(item.maxQuantity);
      setQuantity(item.defaultPackId, stepQuantity(0, 1, rule));
    }
  };

  const label =
    basket.count === 1
      ? t('home.essentials.addOne', { amount: formatRupees(money(basket.paise)) })
      : t('home.essentials.addMany', {
          count: basket.count,
          amount: formatRupees(money(basket.paise)),
        });

  return (
    <View style={styles.module} aria-label={t('home.again.title')}>
      <AccentWash />
      <LetteredTitle
        word={t('home.again.word')}
        sticker={t('home.again.sticker')}
        sub={t('home.again.sub')}
      />
      <View style={styles.pad}>
        <SegmentedTabs
          label={t('home.again.title')}
          options={[
            { key: 'last', label: t('home.again.last') },
            { key: 'most', label: t('home.again.most') },
          ]}
          selected={tab}
          onSelect={(key) => {
            setTab(key === 'most' ? 'most' : 'last');
          }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {list.map((item) => (
            <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} reserveNote={note} />
          ))}
        </View>
      </ScrollView>
      {outOfStock.length > 0 ? (
        <View style={styles.pad}>
          <Text variant="small" color="warning">
            {t('home.again.outOfStock', {
              names: outOfStock.map((item) => item.fullName).join(', '),
            })}
          </Text>
        </View>
      ) : null}
      {toAdd.length > 0 ? (
        <View style={styles.pad}>
          <Button label={label} onPress={addAll} />
        </View>
      ) : null}
    </View>
  );
}
