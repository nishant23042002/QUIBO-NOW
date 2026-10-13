import { Redirect } from 'expo-router';

/**
 * The old All departments address. Departments and categories are one list now (ADR 0046), and it lives on the Categories tab, so
 * an old link or a stale back stack lands there.
 */
export default function DepartmentsScreen() {
  return <Redirect href="/categories" />;
}
