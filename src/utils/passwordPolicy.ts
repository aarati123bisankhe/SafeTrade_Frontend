const PASSWORD_MIN_LENGTH = 12;

export type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Strong" | "Very strong";
  requirements: Array<{
    label: string;
    met: boolean;
  }>;
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  const requirements = [
    {
      label: `At least ${PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /\d/.test(password),
    },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = requirements.filter((requirement) => requirement.met).length;

  if (score >= 5) {
    return {
      score,
      label: "Very strong",
      requirements,
    };
  }

  if (score >= 4) {
    return {
      score,
      label: "Strong",
      requirements,
    };
  }

  if (score >= 3) {
    return {
      score,
      label: "Fair",
      requirements,
    };
  }

  return {
    score,
    label: "Weak",
    requirements,
  };
};
