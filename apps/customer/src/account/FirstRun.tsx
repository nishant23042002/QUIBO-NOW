import { LOCALES, messages } from '@quibo/i18n';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isMobile, phoneDigits, formatPhone } from '@/home/phone';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  Button,
  IconButton,
  Input,
  LogoStacked,
  Notice,
  OptionGroup,
  Text,
  radius,
  space,
} from '@/ui';
import { useAccount } from './AccountProvider';
import {
  CODE_LENGTH,
  checkCode,
  codeDigits,
  resendInSeconds,
  sendCode,
  type OtpResult,
  type OtpState,
} from './otp';

const STEPS = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: space[5] },
    column: { width: '100%', maxWidth: 480, gap: space[5] },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
    },
    dots: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.line },
    dotOn: { width: 24, backgroundColor: c.action },
    logo: { alignItems: 'flex-start', paddingTop: space[2] },
    heading: { gap: space[2] },
    stack: { gap: space[4] },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    link: { minHeight: 44, justifyContent: 'center' },
    consent: { gap: space[1] },
  });

/** The page every first-run step sits in: where the shopper is, the logo, what this step is for, then the step itself. */
function Frame({
  step,
  title,
  body,
  onBack,
  children,
}: {
  step: number;
  title: string;
  body: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const account = useAccount();

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space[3], paddingBottom: insets.bottom + space[6] },
      ]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.column}>
        <View style={styles.top}>
          {onBack !== undefined ? (
            <IconButton icon="back" label={t('common.back')} onPress={onBack} ground="page" />
          ) : (
            <View />
          )}
          <View
            style={styles.dots}
            accessible
            aria-label={t('firstRun.progress', { n: step, total: STEPS })}
          >
            {Array.from({ length: STEPS }, (_, index) => (
              <View key={index} style={[styles.dot, index + 1 === step && styles.dotOn]} />
            ))}
          </View>
        </View>
        <View style={styles.logo}>
          <LogoStacked width={150} ground="page" label={t('app.name')} />
        </View>
        <View style={styles.heading}>
          <Text variant="heading" role="heading">
            {title}
          </Text>
          <Text color="inkMuted">{body}</Text>
        </View>
        {children}
        {__DEV__ ? (
          <Pressable role="button" onPress={account.skip} style={styles.link} hitSlop={8}>
            <Text variant="strong" color="inkMuted">
              {t('firstRun.devSkip')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

/** Step 1: the language. Choosing one changes the words at once, so the shopper sees it work before going on. */
function LanguageStep() {
  const { t, locale, setLocale } = useLanguage();
  const { chooseLanguage } = useAccount();

  return (
    <Frame step={1} title={t('firstRun.languageTitle')} body={t('firstRun.languageBody')}>
      <OptionGroup
        title={t('language.label')}
        options={LOCALES.map((value) => ({ value, label: messages[value].language[value] }))}
        value={locale}
        onChange={setLocale}
      />
      <Button label={t('firstRun.continue')} onPress={chooseLanguage} />
    </Frame>
  );
}

/** Step 2: the mobile number. The agreement is one line under the field, and is logged when the code is checked. */
function PhoneStep() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { requestCode } = useAccount();
  const [typed, setTyped] = useState('');
  const digits = phoneDigits(typed);
  const valid = isMobile(typed);
  // Say what is wrong only once there are enough digits for it to be a number.
  const error = digits.length >= 10 && !valid ? t('firstRun.badPhone') : undefined;

  const send = () => {
    if (valid) requestCode(digits);
  };

  return (
    <Frame step={2} title={t('firstRun.phoneTitle')} body={t('firstRun.phoneBody')}>
      <View style={styles.stack}>
        <Input
          label={t('firstRun.phoneLabel')}
          hint={t('firstRun.phoneHint')}
          value={typed}
          onChangeText={(text) => {
            setTyped(text.replace(/[^\d+ -]/g, ''));
          }}
          error={error}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={16}
          returnKeyType="done"
          onSubmitEditing={send}
        />
        <View style={styles.consent}>
          <Text variant="fine" color="inkMuted">
            {t('firstRun.consent')}
          </Text>
        </View>
        <Button label={t('firstRun.sendCode')} disabled={!valid} onPress={send} />
      </View>
    </Frame>
  );
}

/** Step 3: the code. Five wrong tries, five minutes, and a new code after a short wait, as the real thing will have. */
function CodeStep({ phone }: { phone: string }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { cancelCode, verify } = useAccount();
  const [otp, setOtp] = useState<OtpState>(() => sendCode(Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const [typed, setTyped] = useState('');
  const [problem, setProblem] = useState<OtpResult | null>(null);
  const [resent, setResent] = useState(false);

  // The clock for the wait before a new code, ticking once a second while this step shows.
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const submit = (code: string) => {
    if (codeDigits(code).length !== CODE_LENGTH) return;
    const { result, state } = checkCode(otp, code, Date.now());
    setOtp(state);
    if (result.kind === 'ok') {
      verify(phone);
      return;
    }
    setProblem(result);
    setResent(false);
  };

  const wait = resendInSeconds(otp, now);
  const resend = () => {
    setOtp(sendCode(Date.now()));
    setNow(Date.now());
    setTyped('');
    setProblem(null);
    setResent(true);
  };

  const message =
    problem === null
      ? undefined
      : problem.kind === 'wrong'
        ? t(problem.left === 1 ? 'firstRun.wrongOne' : 'firstRun.wrongMany', { left: problem.left })
        : problem.kind === 'expired'
          ? t('firstRun.expired')
          : problem.kind === 'locked'
            ? t('firstRun.locked')
            : undefined;

  return (
    <Frame
      step={3}
      title={t('firstRun.codeTitle')}
      body={t('firstRun.codeBody', { phone: formatPhone(phone) })}
      onBack={cancelCode}
    >
      <View style={styles.stack}>
        <Input
          label={t('firstRun.codeLabel')}
          value={typed}
          onChangeText={(text) => {
            const code = codeDigits(text);
            setTyped(code);
            setProblem(null);
            setResent(false);
            submit(code);
          }}
          error={message}
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          returnKeyType="done"
        />
        {resent && message === undefined ? (
          <Notice tone="info" icon="check" message={t('firstRun.resent')} />
        ) : null}
        <Button
          label={t('firstRun.verify')}
          disabled={codeDigits(typed).length !== CODE_LENGTH}
          onPress={() => {
            submit(typed);
          }}
        />
        <View style={styles.row}>
          <Pressable
            role="button"
            onPress={cancelCode}
            hitSlop={8}
            style={styles.link}
            aria-label={t('firstRun.changeNumber')}
          >
            <Text variant="strong" color="accentInk">
              {t('firstRun.changeNumber')}
            </Text>
          </Pressable>
          <Pressable
            role="button"
            aria-disabled={wait > 0}
            disabled={wait > 0}
            onPress={resend}
            hitSlop={8}
            style={[styles.link, wait > 0 && { opacity: 0.6 }]}
          >
            <Text variant="strong" color={wait > 0 ? 'inkMuted' : 'accentInk'}>
              {wait > 0 ? t('firstRun.resendIn', { seconds: wait }) : t('firstRun.resend')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Frame>
  );
}

/** The first thing a new shopper sees, until they are signed in: the language, the mobile number, then the code. */
export function FirstRun() {
  const { stage, pendingPhone } = useAccount();
  if (stage === 'language') return <LanguageStep />;
  if (stage === 'otp' && pendingPhone !== null) return <CodeStep phone={pendingPhone} />;
  return <PhoneStep />;
}
