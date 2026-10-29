// Escolha do tipo de animal e ícone de cada tipo (cachorro, gato, passarinho, coelho, outro).
import { Icon, IconName } from "../Icons"
import { speciesOptions } from "../constants"

export function speciesIcon(species: string): IconName {
  if (species === "Cachorro") return "dog"
  if (species === "Gato") return "cat"
  if (species === "Passarinho" || species === "Ave") return "bird"
  if (species === "Coelho") return "rabbit"
  return "paw"
}

export function SpeciesField({
  name,
  value,
  onChange,
}: {
  name: string
  value: string
  onChange: (species: string) => void
}) {
  const labelId = `${name}-species-label`
  return (
    <fieldset className="species-field">
      <legend id={labelId}>
        Espécie <span aria-hidden="true">*</span>
      </legend>
      <div className="species-options" role="radiogroup" aria-labelledby={labelId}>
        {speciesOptions.map((option) => (
          <label
            key={option.name}
            className={value === option.name ? "selected" : undefined}
          >
            <input
              type="radio"
              name={name}
              value={option.name}
              checked={
                value === option.name ||
                (value === "Ave" && option.name === "Passarinho")
              }
              onChange={() => onChange(option.name)}
              required
            />
            <Icon name={option.icon} size={24} />
            <span>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function PetTypeLabel({ species }: { species: string }) {
  const displayName = species === "Ave" ? "Passarinho" : species || "Outro"
  return (
    <div className="pet-type-label">
      <Icon name={speciesIcon(species)} size={22} />
      <span>{displayName}</span>
    </div>
  )
}
