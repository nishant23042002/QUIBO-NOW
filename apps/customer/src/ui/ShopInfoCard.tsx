import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { ProductImage } from './ProductImage';
import { Text } from './Text';
import { fontSize, leading, radius, space } from './tokens';

export interface ShopInfoCardProps {
  name: string;
  /** What the shop sells, for example "Milk, curd, paneer, eggs". Up to two lines. */
  type: string;
  /** Short, because it sits on the picture: "Open now" or "Closed now". */
  statusLabel: string;
  /** More about the status, read out only, for example "Opens 7 AM". */
  statusDetail?: string;
  open: boolean;
  /** What Quibo has checked, for example "Verified by Quibo". Shown as the shield after the name; read out in full. */
  verifiedLabel: string;
  /** How long the shop has served the town. Read out; not shown on the card. */
  sinceLabel: string;
  /** A photo of the shop. Until one is chosen, the placeholder shows. */
  photoUri?: string;
}

/** Every card is the same width and height, so a row of them lines up and the next one peeks in. */
export const SHOP_INFO_CARD_WIDTH = 180;
const PHOTO_RATIO = 1.55;
const INSET = space[2];
const CORNER = space[1] + 2;
/** The name keeps one line and the description two, and both always keep their room. */
const TYPE_LINES = 2;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: SHOP_INFO_CARD_WIDTH,
      padding: INSET,
      gap: space[2],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    photo: { width: '100%' },
    // The tag sits in the picture's corner, so it never covers the middle of it.
    // Open or closed: pistachio for open, a plain outlined pill for closed. Both have a solid
    // fill, so they read on any photo, in both themes.
    tag: {
      position: 'absolute',
      top: CORNER,
      left: CORNER,
      maxWidth: SHOP_INFO_CARD_WIDTH - INSET * 2 - CORNER * 2,
      paddingHorizontal: space[2],
      paddingVertical: 1,
      borderRadius: radius.full,
    },
    openTag: { backgroundColor: c.accent },
    closedTag: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.ctl,
      paddingVertical: 0,
    },
    text: { paddingHorizontal: space[1] },
    // The shield sits right after the name's last letter. The name gives way (and ends in "…") before the shield does.
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    name: { flexShrink: 1 },
  });

/**
 * A simple card for one local shop, built to sit in a swipeable row: the picture first, with a small open or
 * closed tag in its corner, then the shop's name with a verified shield right after it, and what it sells.
 * The name keeps a line and the description two, whatever their length, so every card is the same height.
 */
export function ShopInfoCard({
  name,
  type,
  statusLabel,
  statusDetail,
  open,
  verifiedLabel,
  sinceLabel,
  photoUri,
}: ShopInfoCardProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { locale } = useLanguage();
  const line = (size: number) =>
    Math.round(size * leading[locale === 'en' ? 'latin' : 'devanagari'].normal);
  const status = statusDetail === undefined ? statusLabel : `${statusLabel}. ${statusDetail}`;

  return (
    <View
      accessible
      aria-label={`${name}. ${status}. ${type}. ${verifiedLabel}. ${sinceLabel}`}
      style={styles.card}
    >
      <View style={styles.photo}>
        <ProductImage
          name={name}
          ratio={PHOTO_RATIO}
          {...(photoUri !== undefined ? { uri: photoUri } : {})}
        />
        <View style={[styles.tag, open ? styles.openTag : styles.closedTag]}>
          <Text variant="strong" color={open ? 'onAccent' : 'ink'} numberOfLines={1}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <View style={styles.name}>
            <Text variant="strong" numberOfLines={1}>
              {name}
            </Text>
          </View>
          <Icon name="shield" color={colors.accentInk} size={16} />
        </View>
        <View style={{ minHeight: line(fontSize.sm) * TYPE_LINES }}>
          <Text variant="small" color="inkMuted" numberOfLines={TYPE_LINES}>
            {type}
          </Text>
        </View>
      </View>
    </View>
  );
}
