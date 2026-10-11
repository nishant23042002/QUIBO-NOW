import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AddressEditView } from '@/home/AddressEditView';
import { useLanguage } from '@/i18n/LanguageProvider';
import { AppHeader } from '@/ui';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** Adding an address, or changing the one named in the link. */
export default function AddressEditScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.page}>
      <AppHeader
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
