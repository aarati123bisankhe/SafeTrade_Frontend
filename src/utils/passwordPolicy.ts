export type PasswordStrengthLabel = "Weak" | "Fair" | "Strong" | "Very strong";

export type PasswordStrength = {
  score: number;
  label: PasswordStrengthLabel;
  suggestions: string[];
};

const PASSWORD_MIN_LENGTH = 12;
const MAX_PASSWORD_SCORE = 4;
const COMMON_PATTERNS = ["password", "qwerty", "123456", "abc123", "admin"];
const REPEATED_PATTERN = /(.)\1{2,}/;
const SEQUENCE_PATTERNS = ["1234", "abcd", "qwer"];

const getNormalizedUserInputs = (userInputs: string[]) =>
  userInputs
    .flatMap((value) =>
      value
        .split(/[@._\-\s]+/)
        .map((part) => part.trim().toLowerCase())
        .filter((part) => part.length >= 3),
    )
    .filter(Boolean);

export function evaluatePasswordStrength(
  password: string,
  userInputs: string[] = [],
): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= PASSWORD_MIN_LENGTH) {
    score += 1;
  } else {
    suggestions.push("Use at least 12 characters");
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add uppercase and lowercase letters");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push("Add a special character");
  }

  const normalizedPassword = password.trim().toLowerCase();
  const normalizedUserInputs = getNormalizedUserInputs(userInputs);
  const containsUserInput = normalizedUserInputs.some((value) =>
    normalizedPassword.includes(value),
  );

  if (containsUserInput) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid using your name, username, or email");
  }

  if (COMMON_PATTERNS.some((pattern) => normalizedPassword.includes(pattern))) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid common passwords and predictable patterns");
  }

  if (
    REPEATED_PATTERN.test(normalizedPassword) ||
    SEQUENCE_PATTERNS.some((pattern) => normalizedPassword.includes(pattern))
  ) {
    score = Math.max(0, score - 1);
    suggestions.push("Avoid repeated patterns or easy sequences");
  }

  const uniqueSuggestions = [...new Set(suggestions)];
  const label: PasswordStrengthLabel =
    score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Strong" : "Very strong";

  return {
    score: Math.min(score, MAX_PASSWORD_SCORE),
    label,
    suggestions: uniqueSuggestions,
  };
}
