import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

export default function Input({
  label,
  helperText,
  id,
  className = "",
  ...inputProps
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="ui-field" htmlFor={inputId}>
      <span className="ui-field__label">{label}</span>
      <input
        id={inputId}
        className={["ui-input", className].filter(Boolean).join(" ")}
        {...inputProps}
      />
      {helperText ? <span className="ui-field__helper">{helperText}</span> : null}
    </label>
  );
}
