export type PasswordCheck = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
};

export function checkPassword(password: string): PasswordCheck {
  return {
    minLength: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function passwordMeetsPolicy(password: string): boolean {
  const check = checkPassword(password);
  return check.minLength && check.upper && check.lower && check.number && check.symbol;
}

export const PASSWORD_HINTS: Array<{ key: keyof PasswordCheck; label: string }> = [
  { key: "minLength", label: "At least 10 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "symbol", label: "One symbol" },
];
