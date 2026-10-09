import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AddressEditView } from '@/home/AddressEditView';
import { CartHeader } from '@/home/CartHeader';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** Adding an address, or changing the one named in the link. */
export default function AddressEditScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t(id === undefined ? 'address.addTitle' : 'address.editTitle')}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/address');
        }}
      />
      <AddressEditView id={id} />
    </View>
  );
}
