import { Image, Pressable, Text as NativeText, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  CategoryTileGrid,
  CategoryTileGridSkeleton,
  Icon,
  Skeleton,
  SkeletonLine,
  TAP_MIN,
  Text,
  radius,
  space,
} from '@/ui';
import type { BrowseCategory } from './useCategoryBrowse';

/** The picture in the title row: big enough for the packs to read as shapes and colours, small enough to leave the name room. */
const PICTURE = 64;
const EMOJI_SIZE = 28;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    block: { gap: space[3] },
    // The whole row is the way into the category: its picture, its name and "See all".
    row: {
      minHeight: Math.max(PICTURE, TAP_MIN),
      marginHorizontal: space[4],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
    },
    pressed: { opacity: 0.8 },
    picture: {
      width: PICTURE,
      height: PICTURE,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    plate: { backgroundColor: c.artworkPlate },
    image: { width: '100%', height: '100%' },
    name: { flex: 1, minWidth: 0 },
    more: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

export interface CategoryBlockProps {
  category: BrowseCategory;
  /** The title row was pressed: the category's own screen, on all of its kinds. */
  onOpen: () => void;
  /** A kind's tile was pressed: the category's own screen on that kind. */
  onOpenKind: (subId: string) => void;
}

/**
 * One category on the Categories tab (ADR 0046): a title row with its picture, its name and "See all", then its kinds as tiles four
 * across. The picture is the same one Home's grid shows, so the shopper recognises it; the kinds are the shelves of its own screen.
 */
export function CategoryBlock({ category, onOpen, onOpenKind }: CategoryBlockProps) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const seeAll = t('home.rails.seeAll');

  return (
    <View style={styles.block}>
      <Pressable
        role="button"
        aria-label={`${category.label}, ${seeAll}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View
          style={[
            styles.picture,
            category.picture !== undefined ? styles.plate : { backgroundColor: category.tint },
          ]}
        >
          {category.picture !== undefined ? (
            <Image
              source={category.picture}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              aria-hidden
            />
          ) : (
            <NativeText
              allowFontScaling={false}
              style={{ fontSize: EMOJI_SIZE, lineHeight: EMOJI_SIZE + 8 }}
            >
              {category.emoji}
            </NativeText>
          )}
        </View>
        <View style={styles.name}>
          <Text variant="subheading" numberOfLines={2}>
            {category.label}
          </Text>
        </View>
        <View style={styles.more}>
          <Text variant="strong" color="inkMuted">
            {seeAll}
          </Text>
          <Icon name="chevronRight" color={colors.inkMuted} size={16} />
        </View>
      </Pressable>
      <CategoryTileGrid
        tiles={category.kinds}
        onPress={(index) => {
          const kind = category.kinds[index];
          if (kind !== undefined) onOpenKind(kind.subId);
        }}
      />
    </View>
  );
}

/** The block in grey: the picture, a line for the name, and the kinds' tiles with the lines of name each real one will take. */
export function CategoryBlockSkeleton({ category }: { category: BrowseCategory }) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Skeleton width={PICTURE} height={PICTURE} rounded={radius.md} />
        <View style={styles.name}>
          <SkeletonLine size="lg" tight width="60%" />
        </View>
      </View>
      <CategoryTileGridSkeleton
        count={category.kinds.length}
        names={category.kinds.map((kind) => kind.label)}
      />
    </View>
  );
}
