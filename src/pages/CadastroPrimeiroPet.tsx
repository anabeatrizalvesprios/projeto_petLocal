// Segunda etapa do cadastro: cidade e dados do primeiro pet.
import { FormEvent, useState } from "react"
import { CityCombobox } from "../CityCombobox"
import { Icon } from "../Icons"
import { AuthLayout } from "../components/AuthLayout"
import { Field, SelectField } from "../components/Field"
import { ChipChoice, isIdentifierInUse, PetIdentification } from "../components/PetIdentification"
import { PhotoField } from "../components/PhotoField"
import { SpeciesField } from "../components/SpeciesField"
import { states } from "../constants"
import { hashPassword, makeId, Pet, RegisterDraft, store, User } from "../data"
import { navigate } from "../routes"
import { validateForm } from "../formValidation"

export function CadastroPrimeiroPet({
  draft,
  onComplete,
}: {
  draft: RegisterDraft | null
  onComplete: (user: User) => void
}) {
  const [form, setForm] = useState({
    city: "",
    state: "",
    reference: "",
    petName: "",
    species: "",
    breed: "",
    age: "",
    sex: "",
    color: "",
    notes: "",
    photo: "",
    hasChip: "" as ChipChoice,
    identifierCode: "",
  })
  const [error, setError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [saving, setSaving] = useState(false)
  if (!draft) {
    return (
      <AuthLayout
        title="Cadastro incompleto"
        subtitle="A página foi atualizada e a senha não foi guardada, por segurança. Volte ao cadastro: seu nome, e-mail e telefone já estarão preenchidos."
      >
        <button className="button full" onClick={() => navigate("register")}>
          Voltar ao cadastro
        </button>
      </AuthLayout>
    )
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setCodeError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    if (!form.city.trim())
      return setError(
        "Escolha a cidade na lista que aparece ao digitar, para garantir que o nome esteja correto.",
      )
    if (!form.petName.trim())
      return setError("Preencha o campo “Nome do pet”.")
    if (!form.hasChip || !form.identifierCode.trim()) {
      setCodeError(
        form.hasChip === "no"
          ? 'Clique em "Gerar código" para identificar seu pet.'
          : "Informe se o pet tem chip e preencha o código de identificação.",
      )
      return
    }
    if (isIdentifierInUse(form.identifierCode)) {
      setCodeError(
        "Este código já está cadastrado. Confira o número ou gere outro.",
      )
      return
    }
    setSaving(true)
    try {
      const { hash, salt } = await hashPassword(draft.password)
      const user: User = {
        id: makeId(),
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        passwordHash: hash,
        salt,
        city: form.city.trim(),
        state: form.state,
        reference: form.reference.trim(),
        createdAt: new Date().toISOString(),
      }
      const pet: Pet = {
        id: makeId(),
        userId: user.id,
        name: form.petName.trim(),
        species: form.species,
        breed: form.breed.trim(),
        age: form.age,
        sex: form.sex,
        color: form.color.trim(),
        notes: form.notes.trim(),
        photo: form.photo,
        hasChip: form.hasChip === "yes",
        identifierCode: form.identifierCode.trim().toUpperCase(),
        createdAt: new Date().toISOString(),
      }
      store.saveUser(user)
      store.savePet(pet)
      store.setSession(user.id)
      onComplete(user)
    } catch {
      setError(
        "Não foi possível proteger sua senha neste navegador. Tente novamente.",
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <AuthLayout
      title="Você e seu primeiro pet"
      subtitle="Essas informações podem ser alteradas depois."
    >
      <div className="steps" role="group" aria-label="Etapa 2 de 2: Você e seu pet">
        <span className="done">✓</span>
        <i className="done" />
        <span className="active">2</span>
        <small>Conta</small>
        <small>Você e seu pet</small>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form className="pet-onboarding-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Onde vocês moram?</legend>
          <div className="form-grid">
            <SelectField
              label="Estado"
              name="state"
              value={form.state}
              onChange={(state) => setForm({ ...form, state, city: "" })}
            >
              <option value="">Selecione</option>
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </SelectField>
            <CityCombobox
              state={form.state}
              value={form.city}
              onChange={(city) => setForm({ ...form, city })}
              name="onboarding"
            />
          </div>
          <Field
            label="Ponto de referência (opcional)"
            name="reference"
            value={form.reference}
            onChange={(reference) => setForm({ ...form, reference })}
            placeholder="Ex.: próximo à praça central"
          />
        </fieldset>
        <fieldset>
          <legend>Dados do seu pet</legend>
          <div className="form-grid">
            <Field
              label="Nome do pet"
              name="petName"
              required
              value={form.petName}
              onChange={(petName) => setForm({ ...form, petName })}
            />
            <SpeciesField
              name="first-pet-species"
              value={form.species}
              onChange={(species) => setForm({ ...form, species })}
            />
            <Field
              label="Raça (opcional)"
              name="breed"
              value={form.breed}
              onChange={(breed) => setForm({ ...form, breed })}
              placeholder="Sem raça definida"
            />
            <Field
              label="Idade (opcional)"
              name="age"
              value={form.age}
              onChange={(age) => setForm({ ...form, age })}
              placeholder="Ex.: 3 anos"
            />
            <SelectField
              label="Sexo (opcional)"
              name="first-pet-sex"
              value={form.sex}
              onChange={(sex) => setForm({ ...form, sex })}
              required={false}
            >
              <option value="">Não informar</option>
              <option>Macho</option>
              <option>Fêmea</option>
            </SelectField>
            <Field
              label="Cor predominante (opcional)"
              name="first-pet-color"
              value={form.color}
              onChange={(color) => setForm({ ...form, color })}
              placeholder="Ex.: caramelo e branco"
            />
          </div>
          <PhotoField
            petName={form.petName}
            photo={form.photo}
            onChange={(photo) => setForm({ ...form, photo })}
          />
        </fieldset>
        <PetIdentification
          petName={form.petName}
          hasChip={form.hasChip}
          code={form.identifierCode}
          error={codeError}
          onHasChipChange={(hasChip) =>
            setForm({ ...form, hasChip, identifierCode: "" })
          }
          onCodeChange={(identifierCode) => {
            setCodeError("")
            setForm({ ...form, identifierCode })
          }}
        />
        <button className="button full" type="submit" disabled={saving}>
          {saving ? "Criando conta…" : "Concluir cadastro"}{" "}
          <Icon name="check" />
        </button>
      </form>
    </AuthLayout>
  )
}
