import { useState } from "react";

import Input from "../common/Input";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  name,
  placeholder,
  helperText,
  autoComplete,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

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
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
