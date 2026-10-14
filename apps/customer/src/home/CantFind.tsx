import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Button, Input, Text, radius, space } from '@/ui';
import { REQUEST_MAX_LENGTH } from './askShops';
import { useAskShops } from './useAskShops';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: space[4],
      padding: space[4],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    words: { gap: space[1] },
  });

/**
 * "Can't find something?" (ADR 0055, step 8, decision 6): the shopper types what they need and asks their shops. It is kept on the
 * phone with when they agreed to share it, and goes to the shops in Phase 2. After sending it says it was noted, with a way to ask
 * for something else. Nothing but the words typed is kept.
 */
export function CantFind() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const shops = useAskShops();
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (shops.ask(text)) {
      setSent(true);
      setText('');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.words}>
        <Text variant="subheading" role="heading">
          {t('home.request.title')}
        </Text>
        <Text variant="small" color="inkMuted">
          {sent ? t('home.request.noted') : t('home.request.body')}
        </Text>
      </View>
      {sent ? (
        <Button
          label={t('home.request.another')}
          variant="secondary"
          onPress={() => {
            setSent(false);
          }}
        />
      ) : (
        <>
          <Input
            label={t('home.request.label')}
            placeholder={t('home.request.placeholder')}
            value={text}
            onChangeText={setText}
            maxLength={REQUEST_MAX_LENGTH}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Button label={t('home.request.send')} disabled={text.trim().length < 2} onPress={send} />
        </>
      )}
    </View>
  );
}
