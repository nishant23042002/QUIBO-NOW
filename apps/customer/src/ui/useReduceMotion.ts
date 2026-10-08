import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the phone's "reduce motion" setting is on. Animations then skip straight to their end state. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let current = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (current) setReduce(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      current = false;
      subscription.remove();
    };
  }, []);

  return reduce;
}
