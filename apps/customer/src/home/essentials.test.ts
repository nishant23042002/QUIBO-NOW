import { describe, expect, it } from 'vitest';
import type { HomeItem } from './items';
import {
  ESSENTIALS_PER_TAB,
  ESSENTIAL_TABS,
  defaultEssentialTab,
  liveEssentialTabs,
  openingTab,
} from './essentials';

/** Only the fields the essentials read. */
function item(id: string, out = false): HomeItem {
  return { id, ...(out ? { stock: { kind: 'out', label: 'Out' } } : {}) } as unknown as HomeItem;
}

const everything = [...new Set(ESSENTIAL_TABS.flatMap((tab) => tab.itemIds))].map((id) => item(id));

describe('the tabs', () => {
  it('have unique ids and hold no more than a tab shows, each id once', () => {
    expect(new Set(ESSENTIAL_TABS.map((tab) => tab.id)).size).toBe(ESSENTIAL_TABS.length);
    for (const tab of ESSENTIAL_TABS) {
      expect(new Set(tab.itemIds).size).toBe(tab.itemIds.length);
      expect(tab.itemIds.length).toBeGreaterThan(0);
    }
  });
});

describe('defaultEssentialTab', () => {
  it('follows the day: morning, then cooking, then evening', () => {
    expect(defaultEssentialTab(0)).toBe('morning');
    expect(defaultEssentialTab(10)).toBe('morning');
    expect(defaultEssentialTab(11)).toBe('cooking');
    expect(defaultEssentialTab(16)).toBe('cooking');
    expect(defaultEssentialTab(17)).toBe('evening');
    expect(defaultEssentialTab(23)).toBe('evening');
  });
});

describe('liveEssentialTabs', () => {
  it('lists each tab with its items in the tab order', () => {
    const live = liveEssentialTabs(everything);
    expect(live.map((entry) => entry.tab.id)).toEqual(['morning', 'cooking', 'evening']);
    expect(live[0]?.items.map((entry) => entry.id)).toEqual([
      'milk',
      'curd',
      'eggs',
      'banana',
      'biscuits',
      'apple',
    ]);
  });

  it('leaves out ids that are not stocked and items that are out of stock', () => {
    const stocked = [item('milk'), item('curd', true), item('eggs')];
    const live = liveEssentialTabs(stocked);
    expect(live.find((entry) => entry.tab.id === 'morning')?.items.map((i) => i.id)).toEqual([
      'milk',
      'eggs',
    ]);
  });

  it('drops a tab with nothing to offer, and everything when nothing is stocked', () => {
    expect(liveEssentialTabs([item('tomato')]).map((entry) => entry.tab.id)).toEqual(['cooking']);
    expect(liveEssentialTabs([])).toEqual([]);
  });

  it('never shows more than a tab holds', () => {
    const tabs = [
      {
        id: 'morning' as const,
        label: 'home.essentials.tabs.morning' as const,
        itemIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      },
    ];
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => item(id));
    expect(liveEssentialTabs(many, tabs)[0]?.items).toHaveLength(ESSENTIALS_PER_TAB);
  });
});

describe('openingTab', () => {
  const live = liveEssentialTabs(everything);

  it('opens on the tab for the time of day', () => {
    expect(openingTab(live, 8)?.tab.id).toBe('morning');
    expect(openingTab(live, 13)?.tab.id).toBe('cooking');
    expect(openingTab(live, 20)?.tab.id).toBe('evening');
  });

  it('falls back to the first live tab, and to nothing when there is none', () => {
    const onlyCooking = liveEssentialTabs([item('tomato')]);
    expect(openingTab(onlyCooking, 8)?.tab.id).toBe('cooking');
    expect(openingTab([], 8)).toBeUndefined();
  });
});
