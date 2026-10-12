import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartLayer } from '@/home/CartLayer';
import { CategoriesView } from '@/home/CategoriesView';
import { BOTTOM_BAR_HEIGHT } from '@/ui';

const styles = StyleSheet.create({ page: { flex: 1 } });

/**
 * The Categories tab: groups of tiles, each a way into one kind of thing, under the header Home wears. It is one of the four tabs,
 * so it has no back button.
 */
export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.page}>
      <CategoriesView />
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
