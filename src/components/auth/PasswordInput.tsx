import { useState } from "react";

import Input from "../common/Input"; 
import { evaluatePasswordStrength } from "../../utils/passwordPolicy";

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
  userInputs?: string[];
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
  userInputs = [],
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const strength = showStrengthFeedback
    && value.trim().length > 0
    ? evaluatePasswordStrength(value, userInputs)
    : null;

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
            <strong>Password strength: {strength.label}</strong>
            <span>{strength.score}/4</span>
          </div>
          {strength.label === "Weak" ? (
            <p className="password-strength__message">
              Your password is too weak. Make it stronger before continuing.
            </p>
          ) : strength.label === "Fair" ? (
            <p className="password-strength__message">
              Make your password stronger before continuing.
            </p>
          ) : (
            <p className="password-strength__message password-strength__message--positive">
              Your password is meeting the main security checks.
            </p>
          )}
          <div className="password-strength__bar" aria-hidden="true">
            <span
              className={`password-strength__fill password-strength__fill--${strength.label.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
          {strength.suggestions.length > 0 ? (
            <div className="password-strength__guidance">
              <p>Make your password stronger:</p>
              <ul className="password-strength__suggestions">
                {strength.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
              <p className="password-strength__example">
                Stronger example: <span>Orbit@2026Market!</span>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
