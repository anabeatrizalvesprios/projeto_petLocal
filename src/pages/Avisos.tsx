// Tela 'Avisos': mostra os avisos recebidos de quem viu os pets, com filtro de vistos e não vistos.
import { useRef, useState } from "react"
import { Icon } from "../Icons"
import { BackHome } from "../components/BackHome"
import { PageHeading } from "../components/PageHeading"
import { formatDate, LocationRecord, Pet } from "../data"

type Filter = "new" | "seen" | "all"

export function Avisos({
  pets,
  locations,
  onSetSeen,
}: {
  pets: Pet[]
  locations: LocationRecord[]
  onSetSeen: (id: string, seen: boolean) => void
}) {
  const [filter, setFilter] = useState<Filter>("new")
  const [status, setStatus] = useState("")
  const statusRef = useRef<HTMLParagraphElement>(null)
  const nameOf = (location: LocationRecord) =>
    pets.find((pet) => pet.id === location.petId)?.name ?? "Pet"
  const sorted = [...locations].sort((a, b) => b.seenAt.localeCompare(a.seenAt))
  const newCount = sorted.filter((item) => !item.seen).length
  const seenCount = sorted.length - newCount
  const visible = sorted.filter((item) =>
    filter === "all" ? true : filter === "seen" ? item.seen : !item.seen,
  )
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "new", label: "Não vistos", count: newCount },
    { id: "seen", label: "Vistos", count: seenCount },
    { id: "all", label: "Todos", count: sorted.length },
  ]
  const toggle = (location: LocationRecord) => {
    const seen = !location.seen
    onSetSeen(location.id, seen)
    setStatus(
      `Aviso de ${nameOf(location)} marcado como ${seen ? "visto" : "não visto"}.`,
    )
    // O aviso pode sair da lista atual; o foco vai para a mensagem de status para não se perder.
    window.setTimeout(() => statusRef.current?.focus(), 0)
  }
  const emptyText =
    filter === "new"
      ? "Nenhum aviso novo por enquanto."
      : filter === "seen"
        ? "Você ainda não marcou nenhum aviso como visto."
        : "Nenhum aviso por enquanto."
  return (
    <div className="page">
      <BackHome />
      <PageHeading eyebrow="AVISOS" title="Avisos recebidos" description="Locais informados por pessoas que viram seus pets." />
      <section className="panel" aria-label="Lista de avisos">
        {sorted.length > 0 && (
          <div className="filter-chips" role="group" aria-label="Mostrar avisos">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={filter === item.id ? "active" : undefined}
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id)
                  setStatus("")
                }}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        )}
        <p ref={statusRef} tabIndex={-1} className="alert-status" role="status">
          {status}
        </p>
        {visible.length ? (
          <ol className="timeline alerts-list">
            {visible.map((location) => (
              <li key={location.id} className={location.seen ? "alert-card is-seen" : "alert-card"}>
                <span aria-hidden="true"><Icon name="pin" size={19} /></span>
                <div>
                  <div className="alert-title">
                    <strong className="alert-pet-name">{nameOf(location)}</strong>
                    {!location.seen && <span className="new-badge">Novo</span>}
                  </div>
                  <div className="alert-detail">
                    <span>Local</span>
                    <p>{location.city} – {location.state}</p>
                  </div>
                  <div className="alert-detail">
                    <span>Ponto de referência</span>
                    <p>{location.reference || "Não informado."}</p>
                  </div>
                  <div className="alert-detail">
                    <span>Data e hora</span>
                    <time dateTime={location.seenAt}>{formatDate(location.seenAt)}</time>
                  </div>
                  <div className="alert-detail">
                    <span>Observação</span>
                    <p>{location.details || "Nenhuma observação informada."}</p>
                  </div>
                  <button
                    type="button"
                    className="button secondary alert-seen-button"
                    onClick={() => toggle(location)}
                    aria-label={`${location.seen ? "Marcar como não visto" : "Marcar como visto"}: aviso de ${nameOf(location)}, ${formatDate(location.seenAt)}`}
                  >
                    <Icon name="check" size={18} />{" "}
                    {location.seen ? "Marcar como não visto" : "Marcar como visto"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty-state-simple">
            <Icon name="pin" size={36} />
            <h2>{emptyText}</h2>
            {filter !== "all" && sorted.length > 0 && (
              <button className="text-link" type="button" onClick={() => setFilter("all")}>
                Ver todos os avisos
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
