import { useRouter } from 'expo-router';
import { Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { BOTTOM_BAR_HEIGHT, Button, CategoryHeader, Text, radius, space } from '@/ui';
import { useNotify } from './useNotify';
import { tintColor } from './categoryGroups';
import type { Category } from './catalogueTree';

const PICTURE = 112;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[3],
      padding: space[6],
      paddingBottom: space[6] + BOTTOM_BAR_HEIGHT,
    },
    picture: {
      width: PICTURE,
      height: PICTURE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      opacity: 0.7,
    },
    actions: { alignSelf: 'stretch', marginTop: space[2], gap: space[3] },
  });

/**
 * What a category that is not stocked yet opens: its name and picture, one line saying it is on its way to Roha, and a way back to
 * what is here today, with the same Notify me the tiles have. It makes no promise of a day (ADR 0012's rule for time, kept for
 * dates). Notify me is kept on the phone in Phase 1; telling a shopper when it arrives needs a notification service (Phase 2).
 */
export function ComingToRohaView({ category }: { category: Category }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const notify = useNotify();
  const name = t(category.label);
  const notified = notify.has(category.id);

  return (
    <View style={styles.page}>
      <CategoryHeader
        title={name}
        backLabel={t('common.back')}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/categories');
        }}
      />
      <View style={styles.body}>
        <View style={[styles.picture, { backgroundColor: tintColor(colors, category.tint) }]}>
          <NativeText allowFontScaling={false} style={{ fontSize: 48, lineHeight: 58 }}>
            {category.emoji}
          </NativeText>
        </View>
        <Text variant="heading" align="center" role="heading">
          {t('categoriesTab.comingTitle')}
        </Text>
        <Text color="inkMuted" align="center">
          {t('categoriesTab.comingBody', { name })}
        </Text>
        <View style={styles.actions}>
          <Button
            label={notified ? t('catalogue.notify.on') : t('catalogue.notify.me')}
            variant={notified ? 'secondary' : 'primary'}
            onPress={() => {
              notify.toggle(category.id);
            }}
          />
          <Button
            label={t('categoriesTab.seeToday')}
            variant="secondary"
            onPress={() => {
              router.navigate('/');
            }}
          />
        </View>
      </View>
    </View>
  );
}
