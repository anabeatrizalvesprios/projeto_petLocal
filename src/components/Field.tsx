// Campos de formulário reutilizáveis: Field (texto) e SelectField (lista de opções).
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
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
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
