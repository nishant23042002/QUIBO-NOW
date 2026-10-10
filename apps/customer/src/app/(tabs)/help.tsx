import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { HelpView } from '@/help/HelpView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** Help: a person to talk to, a way to report a problem and the common questions. Opened from Profile and from an order. */
export default function HelpScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('help.title')}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      />
      <HelpView orderId={orderId} />
    </View>
  );
}
