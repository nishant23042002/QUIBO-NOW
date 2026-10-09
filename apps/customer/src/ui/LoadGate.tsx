import type { ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { StatePanel } from './StatePanel';
import type { ScreenLoad } from './useScreenLoad';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fill: { flex: 1 },
    // The skeleton, laid over the real page while it fades in.
    cover: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.bg },
  });

export interface LoadGateProps {
  load: ScreenLoad;
  /** What stands in for the page while it loads: grey blocks in its shape. */
  skeleton: ReactNode;
  /** The page itself. It is drawn from the start, under the skeleton, but cannot be touched until it has loaded. */
  children: ReactNode;
}

/**
 * Shows a page's skeleton while it loads and cross-fades to the page, or a message with "Try again" when it cannot load
 * (no network where the page needs one, or a failed load). The header and the bottom bar stay outside it, so they never
 * flicker.
 */
export function LoadGate({ load, skeleton, children }: LoadGateProps) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  if (load.blocked) {
    const offline = load.phase === 'offline';
    return (
      <View style={styles.fill}>
        <StatePanel
          icon={offline ? 'wifiOff' : 'close'}
          title={offline ? t('state.offline.title') : t('state.error.title')}
          body={offline ? t('state.offline.body') : t('state.error.body')}
          actionLabel={t('state.retry')}
          onAction={load.retry}
        />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Animated.View
        style={[styles.fill, { opacity: load.reveal }]}
        pointerEvents={load.loaded ? 'auto' : 'none'}
        aria-hidden={!load.loaded}
      >
        {children}
      </Animated.View>
      {load.skeletonOn ? (
        <Animated.View
          style={[
            styles.cover,
            { opacity: load.reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
          pointerEvents="none"
        >
          {skeleton}
        </Animated.View>
      ) : null}
    </View>
  );
}
