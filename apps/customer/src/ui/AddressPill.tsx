import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, space } from './tokens';

export interface AddressPillProps {
  /** Small line above the address, for example "Deliver to". Pass a translated string. */
  caption: string;
  /** The saved address or area, for example "Home, Shivaji Nagar". */
  address: string;
  onPress: () => void;
  /** chrome: on the dark header. page: on the page background. */
  ground?: 'chrome' | 'page';
}

const styles = StyleSheet.create({
  pill: {
    minHeight: TAP_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  text: { flexShrink: 1 },
  pressed: { opacity: 0.8 },
});

/** Where the order is going, with a way to change it. Sits in the header or at the top of a page. */
export function AddressPill({ caption, address, onPress, ground = 'chrome' }: AddressPillProps) {
  const { colors } = useTheme();
  const onChrome = ground === 'chrome';

  return (
    <Pressable
      role="button"
      aria-label={`${caption}: ${address}`}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <Icon name="pin" color={onChrome ? colors.accent : colors.accentInk} size={20} />
      <View style={styles.text}>
        <Text variant="small" color={onChrome ? 'onChromeMuted' : 'inkMuted'}>
          {caption}
        </Text>
        <Text variant="strong" color={onChrome ? 'onChrome' : 'ink'} numberOfLines={1}>
          {address}
        </Text>
      </View>
      <Icon name="chevron" color={onChrome ? colors.onChrome : colors.ink} size={16} />
    </Pressable>
  );
}
