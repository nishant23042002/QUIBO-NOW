import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { useCart } from '@/home/CartProvider';
import { CartView } from '@/home/CartView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({
  page: { flex: 1 },
});

/** The cart page, reached from the cart bar. It lives in the tab group so the bottom bar stays. */
export default function CartScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const cart = useCart();

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
      <CartHeader
        title={t('cart.title')}
        {...(cart.count > 0 ? { subtitle: cart.itemsLabel } : {})}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        {...(cart.count > 0
          ? { shareLabel: t('trust.share'), onShare: () => void shareCart() }
          : {})}
      />
      <CartView />
    </View>
  );
}
