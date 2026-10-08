import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';

export interface SheetProps {
  open: boolean;
  /** Called by the close button, the Android back button and a tap on the dimmed area. */
  onClose: () => void;
  /** Heading of the sheet. */
  title: string;
  /** Name of the close button for screen readers. Pass a translated string. */
  closeLabel: string;
  children: ReactNode;
  /** Pinned under the content, for the main action. */
  footer?: ReactNode;
  /** Shown at the top and announced as soon as it appears. */
  error?: string | undefined;
  /** Something inside is loading: announces busy. */
  busy?: boolean;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    scrim: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: c.scrim,
    },
    sheet: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '90%',
      alignSelf: 'center',
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      backgroundColor: c.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingLeft: space[5],
      paddingRight: space[2],
      paddingVertical: space[2],
      borderBottomWidth: 2,
      borderBottomColor: c.line,
    },
    title: { flex: 1 },
    close: {
      width: TAP_MIN,
      height: TAP_MIN,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closePressed: { backgroundColor: c.muted },
    error: {
      paddingHorizontal: space[5],
      paddingVertical: space[3],
      borderBottomWidth: 2,
      borderBottomColor: c.danger,
      backgroundColor: c.dangerBg,
    },
    body: { flexGrow: 0 },
    bodyContent: { paddingHorizontal: space[5], paddingVertical: space[4], gap: space[3] },
    footer: {
      paddingHorizontal: space[5],
      paddingVertical: space[3],
      borderTopWidth: 2,
      borderTopColor: c.line,
    },
  });

/** A bottom sheet. React Native's Modal gives it the back button, a dimmed page and screen-reader focus. */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  error,
  busy = false,
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* A pointer shortcut only: everyone else has the close button and the back button. */}
        <Pressable accessible={false} onPress={onClose} style={styles.scrim} />
        <View aria-modal aria-busy={busy} style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <View style={styles.title}>
              <Text variant="heading">{title}</Text>
            </View>
            <Pressable
              role="button"
              aria-label={closeLabel}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
            >
              <Icon name="close" color={colors.ink} size={22} />
            </Pressable>
          </View>
          {error !== undefined ? (
            <View role="alert" style={styles.error}>
              <Text variant="strong" color="danger">
                {error}
              </Text>
            </View>
          ) : null}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {children}
          </ScrollView>
          {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}
