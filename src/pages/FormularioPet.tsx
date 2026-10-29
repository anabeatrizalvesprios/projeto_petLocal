// Formulário de cadastrar e editar um pet.
import { FormEvent, useState } from "react"
import { Icon } from "../Icons"
import { Field, SelectField } from "../components/Field"
import { PageHeading } from "../components/PageHeading"
import { ChipChoice, isIdentifierInUse, PetIdentification } from "../components/PetIdentification"
import { PhotoField } from "../components/PhotoField"
import { SpeciesField } from "../components/SpeciesField"
import { makeId, Pet } from "../data"
import { validateForm } from "../formValidation"

export function FormularioPet({
  existing,
  userId,
  onSave,
  onCancel,
}: {
  existing: Pet | null
  userId: string
  onSave: (pet: Pet) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    species: existing?.species ?? "",
    breed: existing?.breed ?? "",
    age: existing?.age ?? "",
    sex: existing?.sex ?? "",
    color: existing?.color ?? "",
    notes: existing?.notes ?? "",
    photo: existing?.photo ?? "",
    hasChip:
      existing?.hasChip === true
        ? ("yes" as ChipChoice)
        : existing?.hasChip === false
          ? ("no" as ChipChoice)
          : ("" as ChipChoice),
    identifierCode: existing?.identifierCode ?? "",
  })
  const [error, setError] = useState("")
  const [codeError, setCodeError] = useState("")
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setCodeError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    if (!form.name.trim())
      return setError("Preencha o campo “Nome do pet”.")
    if (!form.hasChip || !form.identifierCode.trim()) {
      setCodeError(
        form.hasChip === "no"
          ? 'Clique em "Gerar código" para identificar seu pet.'
          : "Informe se o pet tem chip e preencha o código de identificação.",
      )
      return
    }
    if (isIdentifierInUse(form.identifierCode, existing?.id)) {
      setCodeError(
        "Este código já está cadastrado. Confira o número ou gere outro.",
      )
      return
    }
    onSave({
      id: existing?.id ?? makeId(),
      userId,
      ...form,
      name: form.name.trim(),
      missing: existing?.missing,
      hasChip: form.hasChip === "yes",
      identifierCode: form.identifierCode.trim().toUpperCase(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    })
  }
  return (
    <div className="page narrow-page">
      <button className="back-link" onClick={onCancel}>
        ← Voltar para meus pets
      </button>
      <PageHeading
        eyebrow={existing ? "EDITAR PET" : "NOVO PET"}
        title={existing ? `Atualizar ${existing.name}` : "Cadastrar um pet"}
        description="Campos com asterisco são obrigatórios."
      />
      <form className="panel form-panel pet-editor-form" onSubmit={submit} noValidate>
        {error && (
          <p className="inline-error" role="alert">
            <Icon name="warning" size={18} /> {error}
          </p>
        )}
        <div className="form-grid">
          <Field
            label="Nome do pet"
            name="pet-name"
            required
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
          />
          <SpeciesField
            name="pet-species"
            value={form.species}
            onChange={(species) => setForm({ ...form, species })}
          />
          <Field
            label="Raça (opcional)"
            name="pet-breed"
            value={form.breed}
            onChange={(breed) => setForm({ ...form, breed })}
            placeholder="Ex.: vira-lata"
          />
          <Field
            label="Idade (opcional)"
            name="pet-age"
            value={form.age}
            onChange={(age) => setForm({ ...form, age })}
            placeholder="Ex.: 3 anos"
          />
          <SelectField
            label="Sexo (opcional)"
            name="pet-sex"
            value={form.sex}
            onChange={(sex) => setForm({ ...form, sex })}
            required={false}
          >
            <option value="">Não informar</option>
            <option>Fêmea</option>
            <option>Macho</option>
          </SelectField>
          <Field
            label="Cor predominante (opcional)"
            name="pet-color"
            value={form.color}
            onChange={(color) => setForm({ ...form, color })}
          />
        </div>
        <div className="field">
          <label htmlFor="pet-notes">
            Observações <span className="optional-label">(opcional)</span>
          </label>
          <textarea
            id="pet-notes"
            value={form.notes}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
            placeholder="Características importantes, cuidados ou identificação"
            rows={4}
          />
        </div>
        <PhotoField
          petName={form.name}
          photo={form.photo}
          onChange={(photo) => setForm({ ...form, photo })}
        />
        <PetIdentification
          petName={form.name}
          hasChip={form.hasChip}
          code={form.identifierCode}
          error={codeError}
          locked={Boolean(existing?.identifierCode)}
          onHasChipChange={(hasChip) =>
            setForm({ ...form, hasChip, identifierCode: "" })
          }
          onCodeChange={(identifierCode) => {
            setCodeError("")
            setForm({ ...form, identifierCode })
          }}
        />
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button" type="submit">
            <Icon name="check" /> Salvar pet
          </button>
        </div>
      </form>
    </div>
  )
}
