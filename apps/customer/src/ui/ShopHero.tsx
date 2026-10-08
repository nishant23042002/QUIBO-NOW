import { StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { ProductImage } from './ProductImage';
import { Text } from './Text';
import { radius, space } from './tokens';

export interface ShopHeroProps {
  name: string;
  /** What the shop sells, for example "Milk, curd, paneer, eggs". */
  type: string;
  /** Short, because it sits on the picture: "Open now" or "Closed now". */
  statusLabel: string;
  open: boolean;
  /** For example "Verified by Quibo". Shown as the shield after the name; read out in full. */
  verifiedLabel: string;
  /** Small facts under the description, each with an icon: the hours, how long it has served the town. */
  facts: readonly { icon: IconName; label: string }[];
  photoUri?: string;
}

const PHOTO_RATIO = 2.8;
const CORNER = space[2];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    hero: { gap: space[3] },
    photo: { borderRadius: radius.lg, overflow: 'hidden' },
    // Open or closed, in the picture's corner, with a solid fill so it reads on any photo in both themes.
    tag: {
      position: 'absolute',
      top: CORNER,
      left: CORNER,
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
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    name: { flexShrink: 1 },
    facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space[4], rowGap: space[1] },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

/**
 * The top of a shop page: the shop's picture with its open or closed tag, then its name with the verified shield
 * right after it, what it sells, and a few small facts. The shield and the facts wrap onto a new line rather than
 * squeeze the name.
 */
export function ShopHero({
  name,
  type,
  statusLabel,
  open,
  verifiedLabel,
  facts,
  photoUri,
}: ShopHeroProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.hero}>
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
      <View>
        <View style={styles.nameRow} accessible aria-label={`${name}. ${verifiedLabel}`}>
          <View style={styles.name}>
            <Text variant="heading" numberOfLines={2}>
              {name}
            </Text>
          </View>
          <Icon name="shield" color={colors.accentInk} size={20} />
        </View>
        <Text color="inkMuted">{type}</Text>
      </View>
      <View style={styles.facts}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.fact}>
            <Icon name={fact.icon} color={colors.accentInk} size={16} />
            <Text variant="small" color="inkMuted">
              {fact.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
