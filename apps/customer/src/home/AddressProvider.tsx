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
  SEED_BOOK,
  addAddress,
  parseBook,
  removeAddress,
  selectAddress,
  selectedAddress,
  serialiseBook,
  updateAddress,
  type AddressBook,
  type AddressDraft,
  type SavedAddress,
} from './addresses';

/** Where the phone keeps the saved addresses, so they are still there after the app is closed. */
const ADDRESSES_KEY = 'quibo.addresses';

export interface Addresses {
  addresses: readonly SavedAddress[];
  /** The address the order goes to, if there is one. */
  selected: SavedAddress | undefined;
  /** False until the saved addresses have been read back, so the screens do not first show the sample and then jump. */
  loaded: boolean;
  /** Saves a new address, makes it the one the order goes to, and returns its id. */
  add: (draft: AddressDraft) => string;
  update: (id: string, draft: AddressDraft) => void;
  remove: (id: string) => void;
  /** Chooses where the order goes. An address we do not deliver to cannot be chosen. */
  select: (id: string) => void;
}

const AddressContext = createContext<Addresses | null>(null);

/**
 * Holds the saved addresses and the one the order goes to for the whole app, kept on the phone. Home's header, the product
 * page, the cart and the address screens all read the same one, so choosing an address changes all of them at once.
 */
export function AddressProvider({ children }: { children: ReactNode }) {
  const [book, setBook] = useState<AddressBook>(SEED_BOOK);
  const [loaded, setLoaded] = useState(false);
  // A change made before the saved addresses have been read back must not be written over by them.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(ADDRESSES_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) setBook(parseBook(saved));
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(ADDRESSES_KEY, serialiseBook(book));
  }, [loaded, book]);

  const change = useCallback((next: (current: AddressBook) => AddressBook) => {
    touched.current = true;
    setBook(next);
  }, []);

  const add = useCallback(
    (draft: AddressDraft) => {
      const id = `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      change((current) => addAddress(current, draft, id));
      return id;
    },
    [change],
  );

  const value: Addresses = {
    addresses: book.addresses,
    selected: selectedAddress(book),
    loaded,
    add,
    update: (id, draft) => {
      change((current) => updateAddress(current, id, draft));
    },
    remove: (id) => {
      change((current) => removeAddress(current, id));
    },
    select: (id) => {
      change((current) => selectAddress(current, id));
    },
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses(): Addresses {
  const addresses = useContext(AddressContext);
  if (addresses === null) throw new Error('useAddresses must be used inside AddressProvider');
  return addresses;
}
