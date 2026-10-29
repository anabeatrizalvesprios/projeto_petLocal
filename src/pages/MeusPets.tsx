// Tela 'Meus pets': lista os pets, edita, exclui e marca como desaparecido ou encontrado.
import { FormEvent, useRef, useState } from "react"
import { CityCombobox } from "../CityCombobox"
import { Icon } from "../Icons"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { BackHome } from "../components/BackHome"
import { Empty } from "../components/Empty"
import { Field, SelectField } from "../components/Field"
import { PageHeading } from "../components/PageHeading"
import { PetTypeLabel, speciesIcon } from "../components/SpeciesField"
import { states } from "../constants"
import { Pet } from "../data"
import { navigate } from "../routes"
import { useDialog } from "../useDialog"
import { validateForm } from "../formValidation"

export function MeusPets({
  pets,
  onEdit,
  onDelete,
  onUpdatePet,
}: {
  pets: Pet[]
  onEdit: (pet: Pet) => void
  onDelete: (pet: Pet) => void
  onUpdatePet: (pet: Pet) => void
}) {
  const [missingPet, setMissingPet] = useState<Pet | null>(null)
  const [foundPet, setFoundPet] = useState<Pet | null>(null)
  return (
    <>
    <div className="page">
      <BackHome />
      <PageHeading
        eyebrow="MEUS PETS"
        title="Seus companheiros"
        description="Consulte, edite ou cadastre os animais da sua família."
        action={
          <button className="button" onClick={() => navigate("pet-form")}>
            <Icon name="plus" /> Novo pet
          </button>
        }
      />
      {pets.length ? (
        <div className="pet-grid">
          {pets.map((pet, index) => (
            <article className="pet-card-full" key={pet.id}>
              <div className={`pet-banner banner-${index % 3}`}>
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={`Foto do pet ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`.trim()}
                  />
                ) : <span aria-hidden="true">
                  <Icon
                    name={speciesIcon(pet.species)}
                    size={68}
                  />
                </span>}
                {pet.missing && <strong className="missing-badge">Desaparecido</strong>}
              </div>
              <div className="pet-content">
                <div className="pet-identity">
                  <div>
                    <span>Nome</span>
                    <strong>{pet.name}</strong>
                  </div>
                  <div>
                    <span>Tipo</span>
                    <PetTypeLabel species={pet.species} />
                  </div>
                </div>
                <p className="pet-breed">{pet.breed || "Sem raça informada"}</p>
                <dl>
                  <div>
                    <dt>Idade</dt>
                    <dd>{pet.age || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt>Sexo</dt>
                    <dd>{pet.sex || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt>Cor</dt>
                    <dd>{pet.color || "Não informada"}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <button
                    className="button secondary"
                    onClick={() => onEdit(pet)}
                  >
                    <Icon name="edit" size={18} /> Editar
                  </button>
                  <button
                    className="button danger-ghost"
                    onClick={() => onDelete(pet)}
                  >
                    <Icon name="trash" size={18} /> Excluir
                  </button>
                  {pet.missing ? (
                    <button
                      className="button found-button"
                      onClick={() => setFoundPet(pet)}
                    >
                      <Icon name="check" size={18} /> Marcar como encontrado
                    </button>
                  ) : (
                    <button
                      className="button warning-button"
                      onClick={() => setMissingPet(pet)}
                    >
                      <Icon name="warning" size={18} /> Marcar como desaparecido
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <Empty
            icon="pets"
            title="Sua lista está vazia"
            text="Cadastre seu primeiro pet para começar."
            action="Cadastrar pet"
            onAction={() => navigate("pet-form")}
          />
        </div>
      )}
    </div>
    {foundPet && (
      <ConfirmDialog
        title={`${foundPet.name} foi encontrado?`}
        text="O aviso “Procura-se” será removido e o pet deixará de aparecer na lista de desaparecidos. Você poderá criar outro aviso depois, se precisar."
        confirmLabel="Sim, foi encontrado"
        tone="success"
        onCancel={() => setFoundPet(null)}
        onConfirm={() => {
          onUpdatePet({ ...foundPet, missing: undefined })
          setFoundPet(null)
        }}
      />
    )}
    {missingPet && (
      <MissingPetDialog
        pet={missingPet}
        onCancel={() => setMissingPet(null)}
        onConfirm={(missing) => {
          onUpdatePet({ ...missingPet, missing })
          setMissingPet(null)
        }}
      />
    )}
    </>
  )
}

function MissingPetDialog({
  pet,
  onCancel,
  onConfirm,
}: {
  pet: Pet
  onCancel: () => void
  onConfirm: (missing: NonNullable<Pet["missing"]>) => void
}) {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const [form, setForm] = useState({
    state: "",
    city: "",
    reference: "",
    seenAt: now.toISOString().slice(0, 16),
    notes: "",
  })
  const [error, setError] = useState("")
  const dialogRef = useRef<HTMLFormElement>(null)
  useDialog(dialogRef, onCancel)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const problem = validateForm(event.currentTarget)
    if (problem) {
      setError(problem)
      return
    }
    if (!form.city.trim()) {
      setError("Escolha a cidade na lista que aparece ao digitar, para garantir que o nome esteja correto.")
      return
    }
    onConfirm({
      city: form.city.trim(),
      state: form.state,
      reference: form.reference.trim(),
      seenAt: new Date(form.seenAt).toISOString(),
      notes: form.notes.trim(),
    })
  }
  return (
    <div className="modal-backdrop">
      <form
        ref={dialogRef}
        noValidate
        className="modal missing-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missing-title"
        onSubmit={submit}
      >
        <h2 id="missing-title">Criar aviso “Procura-se” para {pet.name}</h2>
        <p>Informe onde e quando ele foi visto pela última vez.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <SelectField label="Estado" name="missing-state" value={form.state} onChange={(state) => setForm({ ...form, state, city: "" })}>
          <option value="">Selecione</option>
          {states.map((state) => <option key={state}>{state}</option>)}
        </SelectField>
        <CityCombobox state={form.state} value={form.city} onChange={(city) => setForm({ ...form, city })} name="missing" label="Cidade do último local visto" />
        <Field label="Ponto de referência (opcional)" name="missing-reference" value={form.reference} onChange={(reference) => setForm({ ...form, reference })} />
        <Field label="Data e hora" name="missing-date" type="datetime-local" required value={form.seenAt} onChange={(seenAt) => setForm({ ...form, seenAt })} />
        <div className="field">
          <label htmlFor="missing-notes">Observação (opcional)</label>
          <textarea id="missing-notes" rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className="button" type="submit">Confirmar Procura-se</button>
        </div>
      </form>
    </div>
  )
}
