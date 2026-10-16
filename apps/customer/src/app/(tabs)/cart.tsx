import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useCart } from '@/home/CartProvider';
import { useTintOf } from '@/home/categories';
import { CartView } from '@/home/CartView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The cart page, reached from the cart bar. It lives in the tab group so the bottom bar stays. */
export default function CartScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();
  const tintOf = useTintOf();
  // Once the page is scrolled a little, the first item in the cart slides into the header, with how many more there are.
  const [scrolled, setScrolledState] = useState(false);
  const setScrolled = useCallback((next: boolean) => {
    setScrolledState(next);
  }, []);
  const first = cart.lines[0];
  const more = cart.lines.length - 1;

  // Opens the phone's own share sheet with a line about the cart, so someone at home can say what else is needed.
  // Cancelling it, or a phone with nothing to share to, is not an error worth showing.
  const shareCart = async () => {
    try {
      await Share.share({
        message: t('trust.shareMessage', {
          items: cart.items.map((line) => `${line.name} (${line.quantityLine})`).join(', '),
          total: formatRupees(cart.bill.toPay),
        }),
      });
    } catch {
      // Nothing to do: the shopper closed the sheet, or this phone cannot share.
    }
  };

  return (
    <View style={styles.page}>
      <AppHeader
        title={t('cart.title')}
        {...(cart.count > 0 ? { subtitle: cart.itemsLabel } : {})}
        {...(first !== undefined
          ? {
              thumb: {
                emoji: first.emoji,
                tint: tintOf(first.category),
                ...(more > 0 ? { more: `+${more}` } : {}),
              },
              thumbShown: scrolled,
            }
          : {})}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        {...(cart.count > 0
          ? { shareLabel: t('trust.share'), onShare: () => void shareCart() }
          : {})}
      />
      <CartView onScrolled={setScrolled} />
    </View>
  );
}
