const MARKET_TABS = new Set(['produce', 'labor']);

export function normalizeLaborService(service) {
  return {
    ...service,
    name: service.name || service.service_name,
    rate: service.daily_rate,
  };
}

export function filterMarketplaceItems(items, tab, filters = {}) {
  const query = (filters.query || '').trim().toLocaleLowerCase();
  const minimumPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
  const maximumPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
  const today = new Date().toISOString().slice(0, 10);

  const filtered = items.filter(item => {
    const name = item.name || item.service_name || '';
    const searchText = [
      name,
      item.description,
      item.produce_type,
      item.service_type,
      item.state,
      item.lga,
      item.location_details,
      ...(Array.isArray(item.skills) ? item.skills : []),
    ].filter(Boolean).join(' ').toLocaleLowerCase();
    const price = Number(tab === 'labor' ? item.daily_rate : item.price_per_unit);

    if (query && !searchText.includes(query)) return false;
    if (filters.category && (tab === 'labor' ? item.service_type : item.produce_type) !== filters.category) return false;
    if (filters.condition && item.quality_condition !== filters.condition) return false;
    if (filters.state && item.state !== filters.state) return false;
    if (minimumPrice !== null && (!Number.isFinite(price) || price < minimumPrice)) return false;
    if (maximumPrice !== null && (!Number.isFinite(price) || price > maximumPrice)) return false;
    if (tab === 'produce' && item.expiry_date && item.expiry_date < today) return false;
    return true;
  });

  const sort = filters.sort || 'newest';
  return filtered.sort((a, b) => {
    if (sort === 'price-asc' || sort === 'price-desc') {
      const aPrice = Number(tab === 'labor' ? a.daily_rate : a.price_per_unit);
      const bPrice = Number(tab === 'labor' ? b.daily_rate : b.price_per_unit);
      return sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
    }
    if (sort === 'condition' && tab === 'produce') {
      const conditionOrder = { fresh: 0, good: 1, processing: 2, stored: 3, unspecified: 4 };
      return (conditionOrder[a.quality_condition] ?? 4) - (conditionOrder[b.quality_condition] ?? 4);
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

export function inclusiveCalendarDays(startDate, endDate) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(startDate || '') || !datePattern.test(endDate || '')) {
    throw new Error('Choose a valid start and end date.');
  }

  const isRealDate = value => {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  };
  if (!isRealDate(startDate) || !isRealDate(endDate)) {
    throw new Error('Choose a valid start and end date.');
  }

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new Error('The end date must be on or after the start date.');
  }

  return Math.floor((end - start) / 86_400_000) + 1;
}

export function isMarketplaceTab(tab) {
  return MARKET_TABS.has(tab);
}
