import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMarketplaceItems, inclusiveCalendarDays, normalizeLaborService } from '../marketplaceModel.js';

test('filters produce by search, type, condition, location and budget, then sorts by price', () => {
  const items = [
    { name: 'Tomatoes', produce_type: 'Tomato', quality_condition: 'fresh', state: 'Oyo', price_per_unit: 800, created_at: '2026-10-25' },
    { name: 'Tomato processing grade', produce_type: 'Tomato', quality_condition: 'processing', state: 'Oyo', price_per_unit: 300, created_at: '2026-10-26' },
    { name: 'Rice', produce_type: 'Rice', quality_condition: 'fresh', state: 'Kano', price_per_unit: 500, created_at: '2026-10-24' },
  ];

  assert.deepEqual(
    filterMarketplaceItems(items, 'produce', {
      query: 'tomato',
      category: 'Tomato',
      condition: 'fresh',
      state: 'Oyo',
      minPrice: '500',
      maxPrice: '1000',
      sort: 'price-asc',
    }).map(item => item.name),
    ['Tomatoes'],
  );
});

test('filters and sorts labor services using the database field names', () => {
  const items = [
    { service_name: 'Harvest crew', service_type: 'Harvesting', state: 'Oyo', daily_rate: 1800, created_at: '2026-10-25' },
    { service_name: 'Planting team', service_type: 'Planting', state: 'Oyo', daily_rate: 1200, created_at: '2026-10-26' },
  ];

  const filtered = filterMarketplaceItems(items, 'labor', {
    query: 'crew',
    category: 'Harvesting',
    state: 'Oyo',
    maxPrice: '2000',
    sort: 'price-asc',
  });
  assert.equal(normalizeLaborService(filtered[0]).name, 'Harvest crew');
});

test('hides expired produce listings', () => {
  const expired = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  assert.deepEqual(filterMarketplaceItems([
    { name: 'Expired crop', price_per_unit: 1, expiry_date: expired },
    { name: 'Current crop', price_per_unit: 2 },
  ], 'produce').map(item => item.name), ['Current crop']);
});

test('counts labor dates inclusively and rejects invalid ranges', () => {
  assert.equal(inclusiveCalendarDays('2026-10-26', '2026-10-26'), 1);
  assert.equal(inclusiveCalendarDays('2026-10-26', '2026-10-28'), 3);
  assert.throws(() => inclusiveCalendarDays('2026-10-28', '2026-10-26'), /end date/);
  assert.throws(() => inclusiveCalendarDays('', '2026-10-26'), /valid/);
  assert.throws(() => inclusiveCalendarDays('2026-02-31', '2026-03-02'), /valid/);
});
