export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isPasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
