import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AddressesView } from '@/home/AddressesView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** The saved addresses, opened from Home's header and from the cart. It lives in the tab group so the bottom bar stays. */
export default function AddressScreen() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <View style={styles.page}>
      <AppHeader
        title={t('address.title')}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
      <AddressesView />
    </View>
  );
}
