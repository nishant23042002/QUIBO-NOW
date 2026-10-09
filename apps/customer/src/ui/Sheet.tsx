import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { TAP_MIN, radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

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

const OPEN_MS = 320;
const CLOSE_MS = 220;

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
    scrimTap: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
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

/**
 * The room the phone's own navigation buttons or gesture bar take at the bottom of the window this is drawn in. The sheet
 * is drawn in a window of its own (the modal's), reaching under those buttons, so it has to measure that window, not the
 * app's: the app's window can stop short of the buttons and report no room at all.
 */
function WindowBottom({ children }: { children: (bottom: number) => ReactNode }) {
  return children(useSafeAreaInsets().bottom);
}

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
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { height: screen } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));
  // The modal stays on screen while the sheet slides away, then is taken down when the slide has finished.
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setClosing(true);
  }
  // With reduced motion there is no slide to wait for, so it goes away at once.
  const visible = open || (closing && !reduceMotion);

  useEffect(() => {
    if (!visible) return undefined;
    if (reduceMotion) {
      progress.setValue(open ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? OPEN_MS : CLOSE_MS,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    move.start(({ finished }) => {
      if (finished && !open) setClosing(false);
    });
    return () => {
      move.stop();
    };
  }, [open, visible, reduceMotion, progress]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      // Draw under the status bar and the navigation buttons too, so the dimming covers the whole screen.
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <WindowBottom>
          {(bottom) => (
            <View style={styles.root}>
              {/* The dimming fades in and out by itself while the sheet slides, so it never moves with the sheet. */}
              <Animated.View style={[styles.scrim, { opacity: progress }]} pointerEvents="none" />
              {/* A pointer shortcut only: everyone else has the close button and the back button. */}
              <Pressable accessible={false} onPress={onClose} style={styles.scrimTap} />
              <Animated.View
                aria-modal
                aria-busy={busy}
                style={[
                  styles.sheet,
                  {
                    paddingBottom: bottom,
                    transform: [
                      {
                        translateY: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [screen, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
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
              </Animated.View>
            </View>
          )}
        </WindowBottom>
      </SafeAreaProvider>
    </Modal>
  );
}
