import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  NEW_ACCOUNT,
  chooseLanguage,
  logOut,
  parseAccount,
  serialiseAccount,
  signIn,
  skipSignIn,
  stageOf,
  type AccountData,
  type Stage,
} from './account';

/** Where the phone keeps who is signed in. */
const ACCOUNT_KEY = 'quibo.account';

export interface Account {
  /** False until what is saved has been read back, so the first screen is the right one. */
  loaded: boolean;
  stage: Stage;
  /** The checked phone number, ten digits, once signed in. */
  phone: string | null;
  /** The number a code was just sent to, while it is being checked. */
  pendingPhone: string | null;
  /** The language step is done. */
  chooseLanguage: () => void;
  /** A code has been sent to this number: the code step shows. */
  requestCode: (phone: string) => void;
  /** Back to the phone step, to change the number. */
  cancelCode: () => void;
  /** The code was right: signed in, and the agreement logged with the time. The welcome screen shows over Home. */
  verify: (phone: string) => void;
  /** The welcome screen is on, over Home. */
  welcoming: boolean;
  /** The welcome screen has faded away. */
  finishWelcome: () => void;
  /** Passing the sign-in by hand, for testing (development builds). */
  skip: () => void;
  logOut: () => void;
}

const AccountContext = createContext<Account | null>(null);

/** Holds who is signed in and which first-run step is showing, for the whole app. It is kept on the phone. */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AccountData>(NEW_ACCOUNT);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [welcoming, setWelcoming] = useState(false);
  // A change made before what is saved has been read back must not be written over by it.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(ACCOUNT_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) setData(parseAccount(saved));
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(ACCOUNT_KEY, serialiseAccount(data));
  }, [loaded, data]);

  const change = useCallback((next: (current: AccountData) => AccountData) => {
    touched.current = true;
    setData(next);
  }, []);

  const finishWelcome = useCallback(() => {
    setWelcoming(false);
  }, []);

  const value: Account = {
    loaded,
    stage: stageOf(data, pendingPhone),
    phone: data.phone,
    pendingPhone,
    chooseLanguage: () => {
      change(chooseLanguage);
    },
    requestCode: setPendingPhone,
    cancelCode: () => {
      setPendingPhone(null);
    },
    welcoming,
    finishWelcome,
    verify: (phone) => {
      setPendingPhone(null);
      setWelcoming(true);
      change((current) => signIn(current, phone, new Date()));
    },
    skip: () => {
      change(skipSignIn);
    },
    logOut: () => {
      setPendingPhone(null);
      change(logOut);
    },
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): Account {
  const account = useContext(AccountContext);
  if (account === null) throw new Error('useAccount must be used inside AccountProvider');
  return account;
}
