export interface CountryInfo {
  name: string;
  code: string;
  prefix: string;
  phoneLength: number;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'India', code: 'IN', prefix: '+91', phoneLength: 10 },
  { name: 'United Arab Emirates', code: 'AE', prefix: '+971', phoneLength: 9 },
  { name: 'United Kingdom', code: 'GB', prefix: '+44', phoneLength: 10 },
  { name: 'USA', code: 'US', prefix: '+1', phoneLength: 10 },
];

export const normalizePhone = (phone: string): string => {
  // Remove all characters except digits and leading plus
  let normalized = phone.replace(/[^\d+]/g, '');
  // If it starts with 00, replace with +
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }
  return normalized;
};

export const validatePhone = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // Allow digits only OR leading + followed by digits
  // Length should be 10 to 15 digits
  const digitsOnly = normalized.replace('+', '');
  return /^\+?\d{10,15}$/.test(normalized) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

export const getCountryByPrefix = (phone: string) => {
  const normalized = normalizePhone(phone);
  return COUNTRIES.find(c => normalized.startsWith(c.prefix));
};

export const splitPhone = (phone: string | null | undefined) => {
  if (!phone) return { prefix: '+91', number: '' };
  const normalized = normalizePhone(phone);
  const country = getCountryByPrefix(normalized);
  if (country) {
    return { prefix: country.prefix, number: normalized.replace(country.prefix, '') };
  }
  // Default fallback if no country prefix matched but is 10 digits
  if (normalized.length === 10 && !normalized.startsWith('+')) {
     return { prefix: '+91', number: normalized };
  }
  return { prefix: '', number: normalized };
};
