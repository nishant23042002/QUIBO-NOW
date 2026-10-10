import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { CartHeader } from '@/home/CartHeader';
import { ReportView } from '@/help/ReportView';
import { useLanguage } from '@/i18n/LanguageProvider';

const styles = StyleSheet.create({ page: { flex: 1 } });

/** Report a problem with an order, opened from Help. */
export default function ReportScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  return (
    <View style={styles.page}>
      <CartHeader
        title={t('help.report.title')}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/help');
        }}
      />
      <ReportView orderId={orderId} />
    </View>
  );
}
