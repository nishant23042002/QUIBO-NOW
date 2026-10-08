import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSampleShops } from '@/home/sampleShops';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { HomeHeader } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({ page: { flex: 1, backgroundColor: c.bg } });

// Phase 1a is built one section at a time. So far: the header and the shops row it opens.
export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const shops = useSampleShops();
  const openCount = shops.filter((shop) => shop.open).length;

  return (
    <View style={styles.page}>
      <HomeHeader
        deliveryLine={t('home.header.deliveryToday', { window: t('home.header.sampleWindow') })}
        address={t('home.header.sampleAddress')}
        addressCaption={t('home.header.addressCaption')}
        shops={shops}
        shopsLabel={t('home.header.shopsOpen', { count: openCount })}
        shopsTitle={t('home.shopsSheet.title')}
        profileLabel={t('home.header.profile')}
        onAddressPress={() => undefined}
        onProfilePress={() => {
          router.push('/profile');
        }}
      />
    </View>
  );
}
