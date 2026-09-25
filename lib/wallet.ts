export const getBalance = () => {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem('cp_balance') || '0');
};
export const addBalance = (a: number) => {
  const b = getBalance() + a;
  localStorage.setItem('cp_balance', String(b));
  return b;
};
export const deductBalance = (a: number) => {
  const b = getBalance();
  if (b < a) return false;
  localStorage.setItem('cp_balance', String(b - a));
  return true;
};
