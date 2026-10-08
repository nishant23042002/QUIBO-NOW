import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { BackHandler, Platform, StyleSheet, View } from 'react-native';
import { useHomeItems } from '@/home/items';
import { ProductView } from '@/home/ProductView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader, BOTTOM_BAR_HEIGHT, StatePanel } from '@/ui';

const styles = StyleSheet.create({
  page: { flex: 1 },
  missing: { flex: 1, paddingBottom: BOTTOM_BAR_HEIGHT },
});

/**
 * An item's page. The item is picked by the id in the address; an id that matches no item gets a way back instead.
 *
 * Every item page is the same screen with a different id, so the tab navigator would take "back" straight past
 * the item you came from. This page keeps its own trail of the items opened one from another (for example
 * from "More from this shop"), and back steps through them before it leaves the page.
 */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const router = useRouter();
  const item = useHomeItems().find((candidate) => candidate.id === id);

  const trail = useRef<string[]>([]);

  // An item opened from this page (a card in "More from this shop" or "Popular in"): remember the one showing now,
  // so back can return to it. Opening an item from anywhere else starts a fresh trail.
  const openRelated = useCallback(() => {
    if (id !== undefined) trail.current.push(id);
  }, [id]);

  // Back to the item before this one, if there is one. Returns whether it did.
  const stepBack = useCallback((): boolean => {
    const previous = trail.current.pop();
    if (previous === undefined) return false;
    router.setParams({ id: previous });
    return true;
  }, [router]);

  // Leaving the page forgets the trail, so the next visit starts fresh. The phone's back button follows the trail too.
  useFocusEffect(
    useCallback(() => {
      // The phone's back button exists on Android only (the web has none, and BackHandler throws there).
      const subscription =
        Platform.OS === 'android'
          ? BackHandler.addEventListener('hardwareBackPress', stepBack)
          : undefined;
      return () => {
        subscription?.remove();
        trail.current = [];
      };
    }, [stepBack]),
  );

  // Back goes where the shopper came from; opened from a link with nowhere to go back to, it goes Home.
  const back = () => {
    if (stepBack()) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.page}>
      {item === undefined ? (
        <>
          <AppHeader title="" backLabel={t('common.back')} onBack={back} />
          <View style={styles.missing}>
            <StatePanel
              icon="bag"
              title={t('product.notFound.title')}
              body={t('product.notFound.body')}
              actionLabel={t('product.notFound.back')}
              onAction={() => {
                router.replace('/');
              }}
            />
          </View>
        </>
      ) : (
        <ProductView key={item.id} item={item} onBack={back} onOpenRelated={openRelated} />
      )}
    </View>
  );
}
