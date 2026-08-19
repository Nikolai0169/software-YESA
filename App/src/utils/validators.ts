export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return false;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!local || !domain) return false;
  if (local.length > 64 || domain.length > 255) return false;
  if (!domain.includes('.')) return false;

  const localAllowed = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  const domainAllowed = /^[A-Za-z0-9.-]+$/;

  if (!localAllowed.test(local)) return false;
  if (!domainAllowed.test(domain)) return false;

  const labels = domain.split('.');
  for (const label of labels) {
    if (!label.length || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
  }

  return true;
}
