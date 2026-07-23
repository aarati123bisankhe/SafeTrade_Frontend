import { useState } from "react";

import Input from "../common/Input"; 
import { getPasswordStrength } from "../../utils/passwordPolicy";

type PasswordInputProps = { 
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  required?: boolean;
  showStrengthFeedback?: boolean;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  name,
  placeholder,
  helperText,
  autoComplete,
  required = false,
  showStrengthFeedback = false,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const strength = showStrengthFeedback ? getPasswordStrength(value) : null;

  return (
    <div className="password-field">
      <Input
        label={label}
        name={name}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        helperText={helperText}
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
      {strength ? (
        <div className="password-strength">
          <div className="password-strength__header">
            <strong>Password strength</strong>
            <span>{strength.label}</span>
          </div>
          <div className="password-strength__bar" aria-hidden="true">
            <span
              className={`password-strength__fill password-strength__fill--${strength.label.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
          <div className="password-strength__requirements">
            {strength.requirements.map((requirement) => (
              <span
                key={requirement.label}
                className={
                  requirement.met
                    ? "password-strength__requirement password-strength__requirement--met"
                    : "password-strength__requirement"
                }
              >
                {requirement.met ? "OK" : "Need"} {requirement.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
