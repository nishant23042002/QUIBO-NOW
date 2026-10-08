import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/** Whether the on-screen keyboard is up. The bottom bar and the cart bar step aside while it is, as they would only ride on top of it. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setVisible(true);
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setVisible(false);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
