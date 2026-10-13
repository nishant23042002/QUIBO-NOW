import { useRouter } from 'expo-router';
import { Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { BOTTOM_BAR_HEIGHT, Button, CategoryHeader, Text, radius, space } from '@/ui';
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
    actions: { alignSelf: 'stretch', marginTop: space[2] },
  });

/**
 * What a department that is not stocked yet opens: its name and picture, one line saying it is on its way to Roha, and a way back to
 * what is here today. It makes no promise of a day (ADR 0012's rule for time, kept for dates) and takes no sign-up: telling a shopper
 * when it arrives needs a notification service (Phase 2).
 */
export function ComingToRohaView({ department }: { department: Category }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const name = t(department.label);

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
        <View style={[styles.picture, { backgroundColor: tintColor(colors, department.tint) }]}>
          <NativeText allowFontScaling={false} style={{ fontSize: 48, lineHeight: 58 }}>
            {department.emoji}
          </NativeText>
        </View>
        <Text variant="heading" align="center" role="heading">
          {t('departments.comingTitle')}
        </Text>
        <Text color="inkMuted" align="center">
          {t('departments.comingBody', { name })}
        </Text>
        <View style={styles.actions}>
          <Button
            label={t('departments.seeToday')}
            onPress={() => {
              router.navigate('/');
            }}
          />
        </View>
      </View>
    </View>
  );
}
