function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '$0';
  const cleaned = String(value).replace(/\s+/g, '').replace(/\$/g, '').replace(/[^0-9,.-]/g, '');
  if (!cleaned) return '$0';
  let normalized = cleaned;
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastComma > lastDot) normalized = cleaned.replace(/\./g, '').replace(',', '.');
    else normalized = cleaned.replace(/,/g, '');
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[0].length <= 3 && parts[1].length === 3)) normalized = cleaned.replace(/,/g, '');
    else normalized = cleaned.replace(',', '.');
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[0].length <= 3 && parts[1].length === 3)) normalized = cleaned.replace(/\./g, '');
  }
  const numero = Number(normalized);
  const hasDecimals = !Number.isInteger(numero);
  return { cleaned, normalized, numero, formatted: new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', minimumFractionDigits: hasDecimals ? 2 : 0, maximumFractionDigits: hasDecimals ? 2 : 0}).format(numero) };
}
console.log('25.000 =>', formatCurrency('25.000'));
console.log('25,000 =>', formatCurrency('25,000'));
console.log('25.000,50 =>', formatCurrency('25.000,50'));
console.log('25,000.50 =>', formatCurrency('25,000.50'));
console.log('25000 =>', formatCurrency('25000'));
