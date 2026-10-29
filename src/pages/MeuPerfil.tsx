// Tela 'Meu perfil': dados da conta da pessoa.
import { FormEvent, useState } from "react"
import { Icon } from "../Icons"
import { Field, SelectField } from "../components/Field"
import { BackHome } from "../components/BackHome"
import { PageHeading } from "../components/PageHeading"
import { states } from "../constants"
import { User } from "../data"
import { CityCombobox } from "../CityCombobox"
import { validateForm } from "../formValidation"

export function MeuPerfil({
  user,
  onSave,
}: {
  user: User
  onSave: (user: User) => void
}) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    city: user.city,
    state: user.state,
    reference: user.reference,
  })
  const [error, setError] = useState("")
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    if (!form.city.trim())
      return setError("Escolha a cidade na lista que aparece ao digitar.")
    onSave({ ...user, ...form, name: form.name.trim() })
  }
  return (
    <div className="page narrow-page">
      <BackHome />
      <PageHeading
        eyebrow="MEU PERFIL"
        title="Seus dados"
        description="Mantenha suas informações de contato e endereço atualizadas."
      />
      <div className="profile-summary">
        <div className="avatar large-avatar" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
          <small>
            Conta criada em{" "}
            {new Intl.DateTimeFormat("pt-BR").format(new Date(user.createdAt))}
          </small>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={submit} noValidate>
        {error && (
          <p className="inline-error" role="alert">
            <Icon name="warning" size={18} /> {error}
          </p>
        )}
        <Field
          label="Nome completo"
          name="profile-name"
          required
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          autoComplete="name"
        />
        <Field
          label="E-mail"
          name="profile-email"
          value={user.email}
          readOnly
          onChange={() => {}}
          hint="O e-mail de acesso não pode ser alterado nesta versão."
        />
        <Field
          label="Telefone"
          name="profile-phone"
          type="tel"
          mask="phone"
          required
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          autoComplete="tel"
          hint="Este número aparece para quem encontrar um dos seus pets."
        />
        <div className="form-grid">
          <SelectField
            label="Estado"
            name="profile-state"
            value={form.state}
            onChange={(state) => setForm({ ...form, state, city: state === form.state ? form.city : "" })}
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
            name="profile"
          />
        </div>
        <Field
          label="Ponto de referência"
          name="profile-reference"
          value={form.reference}
          onChange={(reference) => setForm({ ...form, reference })}
        />
        <div className="form-actions">
          <button className="button" type="submit">
            <Icon name="check" /> Salvar alterações
          </button>
        </div>
      </form>
      <div className="privacy-card">
        <Icon name="shield" />
        <div>
          <strong>Privacidade dos seus dados</strong>
          <p>
            Todos os dados do PetLocal ficam armazenados localmente neste
            navegador. Ao limpar os dados do navegador, suas informações serão
            removidas.
          </p>
        </div>
      </div>
    </div>
  )
}
