export function normalizeUsername(value = '') {
  return String(value).trim().replace(/^@/, '').toLowerCase();
}

export function isValidUsername(value = '') {
  return /^[a-z0-9_]{3,32}$/.test(value) && !['member', 'username', 'user'].includes(value);
}

export function createDefaultUsername(name, userId, email = '') {
  const clean = value => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const emailName = String(email || '').split('@')[0];
  const namePrefix = clean(name);
  const emailPrefix = clean(emailName);
  const base = namePrefix && namePrefix !== 'farm_user' ? namePrefix : emailPrefix || namePrefix || 'farmer';
  const prefix = base.slice(0, 10) || 'farmer';
  const suffix = String(userId || '').replace(/-/g, '').toLowerCase().slice(0, 20);
  if (!suffix) throw new Error('A user ID is required to create a username.');
  return `${prefix}_${suffix}`;
}
