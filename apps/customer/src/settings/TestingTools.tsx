import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { setConditions, useConditions } from '@/home/conditions';
import { useLanguage } from '@/i18n/LanguageProvider';
import { armFailNext, setSimulatedOffline, useFailNextArmed, useSimulatedOffline } from '@/network';
import { Button, OptionGroup, space } from '@/ui';

/**
 * The switches testers use to rehearse a bad connection, a festival day, rain, a busy hour, the kind of store, how fast an order
 * moves and how the next one ends, and the way to the components gallery. It is loaded only in development builds (see
 * `SettingsView`), so none of it, nor the gallery behind it, is in what shoppers install.
 */
export default function TestingTools() {
  const { t } = useLanguage();
  const router = useRouter();
  const offline = useSimulatedOffline();
  const failArmed = useFailNextArmed();
  const conditions = useConditions();

  return (
    <View style={{ gap: space[6] }}>
      <OptionGroup
        title={t('profile.dev.network')}
        options={[
          { value: 'online', label: t('profile.dev.online') },
          { value: 'offline', label: t('profile.dev.offline') },
        ]}
        value={offline ? 'offline' : 'online'}
        onChange={(value) => {
          setSimulatedOffline(value === 'offline');
        }}
      />
      <OptionGroup
        title={t('profile.dev.festival')}
        options={[
          { value: 'off', label: t('profile.dev.festivalOff') },
          { value: 'on', label: t('profile.dev.festivalOn') },
        ]}
        value={conditions.festival ? 'on' : 'off'}
        onChange={(value) => {
          setConditions({ festival: value === 'on' });
        }}
      />
      <OptionGroup
        title={t('profile.dev.rain')}
        options={[
          { value: 'dry', label: t('profile.dev.dry') },
          { value: 'rain', label: t('profile.dev.raining') },
        ]}
        value={conditions.rain ? 'rain' : 'dry'}
        onChange={(value) => {
          setConditions({ rain: value === 'rain' });
        }}
      />
      <OptionGroup
        title={t('profile.dev.rush')}
        options={[
          { value: 'clock', label: t('profile.dev.byClock') },
          { value: 'rush', label: t('profile.dev.rushNow') },
        ]}
        value={conditions.rush ? 'rush' : 'clock'}
        onChange={(value) => {
          setConditions({ rush: value === 'rush' });
        }}
      />
      <OptionGroup
        title={t('profile.dev.store')}
        options={[
          { value: 'partner', label: t('profile.dev.partnerShops') },
          { value: 'dark', label: t('profile.dev.darkStore') },
        ]}
        value={conditions.store}
        onChange={(value) => {
          setConditions({ store: value });
        }}
      />
      <OptionGroup
        title={t('profile.dev.orderSpeed')}
        options={[
          { value: 'fast', label: t('profile.dev.speedFast') },
          { value: 'slow', label: t('profile.dev.speedSlow') },
        ]}
        value={conditions.orderSpeed}
        onChange={(value) => {
          setConditions({ orderSpeed: value });
        }}
      />
      <OptionGroup
        title={t('profile.dev.ending')}
        options={[
          { value: 'delivered', label: t('profile.dev.endDelivered') },
          { value: 'rejected', label: t('profile.dev.endRejected') },
          { value: 'cancelled', label: t('profile.dev.endCancelled') },
          { value: 'undelivered', label: t('profile.dev.endUndelivered') },
        ]}
        value={conditions.orderEnding}
        onChange={(value) => {
          setConditions({ orderEnding: value });
        }}
      />
      <View style={{ gap: space[3] }}>
        <Button
          label={failArmed ? t('profile.dev.failArmed') : t('profile.dev.fail')}
          variant="secondary"
          disabled={failArmed}
          onPress={armFailNext}
        />
        <Button
          label={t('components.title')}
          variant="secondary"
          onPress={() => {
            router.push('/components');
          }}
        />
      </View>
    </View>
  );
}
