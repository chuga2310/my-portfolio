/**
 * Month the "years shipping" figure counts from ('YYYY-MM'): right after FPT Polytechnic (Jan–Jun 2018),
 * whose teaching-assistant months don't count as experience.
 */
export const CAREER_START = '2018-07';

/**
 * Years since CAREER_START: past the half-year it rounds up ("9"), otherwise it reads "8+".
 * No imports, so vite.config.ts can use it to fill the same figure into index.html at build time.
 */
export function yearsShipping(now = new Date()) {
  const [y, m] = CAREER_START.split('-').map(Number);
  const years = (now.getFullYear() * 12 + now.getMonth() - (y * 12 + m - 1)) / 12;
  return years - Math.floor(years) > 0.5 ? String(Math.ceil(years)) : `${Math.floor(years)}+`;
}
