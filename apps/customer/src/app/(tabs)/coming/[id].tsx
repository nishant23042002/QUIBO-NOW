import { Redirect, useLocalSearchParams } from 'expo-router';
import { ComingToRohaView } from '@/home/ComingToRohaView';
import { categoryRoute, isLive, resolveCategories } from '@/home/categoryLists';
import { useHomeItems } from '@/home/items';

/**
 * The page of a category that is not stocked yet, picked by the id in the address: "Coming to Roha". A live category has a shelf, so
 * it goes there; an id that matches none goes to the category screen, which has its own "not found" page.
 */
export default function ComingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // As the shopper sees it: a live category with nothing in stock reads as coming, so it is never sent to an empty shelf.
  const found = resolveCategories(useHomeItems()).find((entry) => entry.id === id);

  if (found === undefined) {
    return <Redirect href={{ pathname: '/category/[id]', params: { id: id ?? '' } }} />;
  }
  if (isLive(found)) return <Redirect href={categoryRoute(found)} />;
  return <ComingToRohaView category={found} />;
}
