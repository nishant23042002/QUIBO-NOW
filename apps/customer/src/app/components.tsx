import { Redirect } from 'expo-router';
import { Suspense, lazy } from 'react';

/**
 * The components gallery is for developers: every building block in every state. It is loaded only in development builds. In a
 * release build the condition is a constant, so the bundler drops the import and the gallery's code with it, and the route sends
 * anyone who finds it back to Home.
 */
const Gallery = __DEV__
  ? lazy(() =>
      import('@/dev/ComponentsGallery').then((module) => ({ default: module.ComponentsGallery })),
    )
  : null;

export default function ComponentsScreen() {
  if (Gallery === null) return <Redirect href="/" />;
  return (
    <Suspense fallback={null}>
      <Gallery />
    </Suspense>
  );
}
