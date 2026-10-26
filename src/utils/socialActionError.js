export function socialActionError(error, action) {
  const message = error?.message || '';

  if (error?.code === 'PGRST202' || error?.code === '42883') {
    return `The required Supabase function for ${action} is missing. Apply the social/community actions migration, then try again.`;
  }

  if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(error?.code)) {
    return `The database schema for ${action} is incomplete. Apply the social/community actions migration, then try again.`;
  }

  if (error?.code === '42501') {
    return message
      ? `Supabase denied ${action}: ${message}`
      : `Supabase denied ${action}. Check your sign-in and community permissions.`;
  }

  return message || `Unable to ${action}. Please try again.`;
}
