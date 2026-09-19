// Only transaction identifiers are accepted, never arbitrary redirect URLs.
export function invitationId(value: string | null | undefined) {
  return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? value : '';
}
export function invitationPath(value: string | null | undefined) {
  const id = invitationId(value);
  return id ? `/?transaction=${encodeURIComponent(id)}` : '/';
}
