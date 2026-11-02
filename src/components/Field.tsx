// Campos de formulário reutilizáveis: Field (texto) e SelectField (lista de opções).
import { useState } from "react"
import { Icon } from "../Icons"
import { formatPhone } from "../formValidation"


export function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  hint,
  autoComplete,
  minLength,
  readOnly,
  mask,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  autoComplete?: string
  minLength?: number
  readOnly?: boolean
  mask?: "phone"
}) {
  const id = `field-${name}`
  const [showPassword, setShowPassword] = useState(false)
  // Ícones (signos) para ajudar a reconhecer o campo: envelope no e-mail, cadeado na senha.
  const isPassword = type === "password"
  const icon = type === "email" ? "mail" : isPassword ? "lock" : null
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="input-wrap">
      {icon && (
        <span className="input-icon" aria-hidden="true">
          <Icon name={icon} size={20} />
        </span>
      )}
      <input
        className={`${icon ? "has-icon" : ""} ${isPassword ? "has-toggle" : ""}`.trim() || undefined}
        id={id}
        name={name}
        type={isPassword && showPassword ? "text" : type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(mask === "phone" ? formatPhone(event.target.value) : event.target.value)
        }
        placeholder={placeholder}
        readOnly={readOnly}
        data-kind={mask}
        inputMode={mask === "phone" ? "tel" : undefined}
        maxLength={mask === "phone" ? 15 : undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        autoComplete={autoComplete}
        minLength={minLength}
      />
      {isPassword && (
        <button
          type="button"
          className="toggle-password"
          aria-label="Mostrar senha"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((current) => !current)}
        >
          <Icon name={showPassword ? "eye-off" : "eye"} size={22} />
        </button>
      )}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  )
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  required = true,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <select
        id={`field-${name}`}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  )
}
