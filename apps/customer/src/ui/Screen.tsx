import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from './tokens';

/** Every screen starts with this: it scrolls, keeps the standard gutters and stays readable on a tablet. */
export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: space[6] + insets.bottom }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { alignItems: 'center', paddingHorizontal: space[4], paddingTop: space[6] },
  column: { width: '100%', maxWidth: 560, gap: space[6] },
});
