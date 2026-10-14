import { Image, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import SCOOTER from '../../assets/delivery-scooter.png';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { space } from './tokens';

/** How big the scooter is on the route, and how far along it rides (0 is the shop, 1 is the door). */
const SCOOTER_SIZE = 36;
const RIDE = 0.58;
const ROUTE_HEIGHT = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    lines: { gap: space[1] },
    wrap: {
      paddingHorizontal: space[4],
      paddingTop: space[8],
      paddingBottom: space[6],
      gap: space[4],
    },
    // The tagline, large and ghosted: the page's last word, felt rather than read.
    ghost: { maxWidth: '58%', opacity: 0.2 },
    // A short pistachio bar under it: the one spot of colour.
    accent: { width: 40, height: 4, borderRadius: 2, backgroundColor: c.accent },
    route: { flexDirection: 'row', alignItems: 'center', gap: space[3], height: ROUTE_HEIGHT },
    path: { flex: 1, height: ROUTE_HEIGHT, justifyContent: 'center' },
    rider: { position: 'absolute', top: 0, width: SCOOTER_SIZE, height: SCOOTER_SIZE },
    riderImage: { width: SCOOTER_SIZE, height: SCOOTER_SIZE },
  });

/**
 * The page's last thing: Quibo's own line, "Dukaan se ghar tak" (from the shop to the home), set large and ghosted, and under it the
 * journey it names, drawn as the dotted route the rest of the app already uses: a shop, the scooter on its way, a home. Then one quiet
 * sentence about where the order comes from. It is a closing, not a control, and it uses nothing but what the app already owns.
 */
export function BrandFooter() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <View
      style={styles.wrap}
      accessible
      aria-label={`${t('app.tagline')} ${t('footer.line')} ${t('footer.money')}`}
    >
      <View style={styles.ghost} aria-hidden>
        <Text variant="title" numberOfLines={3}>
          {t('app.tagline')}
        </Text>
      </View>
      <View style={styles.accent} aria-hidden />
      <View style={styles.route} aria-hidden>
        <Icon name="store" color={colors.ctl} size={22} />
        <View style={styles.path}>
          <Svg width="100%" height={2}>
            <Line
              x1="1"
              y1="1"
              x2="100%"
              y2="1"
              stroke={colors.ctl}
              strokeOpacity={0.6}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="0.1 5"
            />
          </Svg>
          <View style={[styles.rider, { left: `${RIDE * 100}%`, marginLeft: -SCOOTER_SIZE / 2 }]}>
            <Image source={SCOOTER} resizeMode="contain" style={styles.riderImage} />
          </View>
        </View>
        <Icon name="home" color={colors.ctl} size={22} />
      </View>
      <View style={styles.lines}>
        <Text variant="small" color="inkMuted">
          {t('footer.line')}
        </Text>
        <Text variant="small" color="inkMuted">
          {t('footer.money')}
        </Text>
      </View>
    </View>
  );
}
