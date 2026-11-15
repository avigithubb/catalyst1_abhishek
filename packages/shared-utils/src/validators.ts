export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPasscode = (passcode: string): boolean => {
  return /^\d{4,8}$/.test(passcode);
};

export const isPasswordStrong = (password: string): boolean => {
  return password.length >= 6;
};
