import { useEffect, useMemo, useRef, useState } from "react"

const fallbackCities: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"], AL: ["Maceió", "Arapiraca"], AP: ["Macapá", "Santana"],
  AM: ["Manaus", "Parintins"], BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  CE: ["Fortaleza", "Juazeiro do Norte", "Sobral"], DF: ["Brasília"], ES: ["Vitória", "Vila Velha", "Serra"],
  GO: ["Goiânia", "Anápolis", "Aparecida de Goiânia"], MA: ["São Luís", "Imperatriz"],
  MT: ["Cuiabá", "Rondonópolis"], MS: ["Campo Grande", "Dourados"], MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
  PA: ["Belém", "Santarém", "Marabá"], PB: ["João Pessoa", "Campina Grande"], PR: ["Curitiba", "Londrina", "Maringá"],
  PE: ["Recife", "Caruaru", "Petrolina"], PI: ["Teresina", "Parnaíba"], RJ: ["Rio de Janeiro", "Niterói", "Petrópolis"],
  RN: ["Natal", "Mossoró"], RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"], RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"], SC: ["Florianópolis", "Joinville", "Blumenau"],
  SP: ["São Paulo", "Birigui", "Araçatuba", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto", "São José do Rio Preto"],
  SE: ["Aracaju", "Nossa Senhora do Socorro"], TO: ["Palmas", "Araguaína"],
}

const cache = new Map<string, string[]>()
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

export function CityCombobox({
  state,
  value,
  onChange,
  name,
  label = "Cidade",
  required = true,
}: {
  state: string
  value: string
  onChange: (city: string) => void
  name: string
  label?: string
  required?: boolean
}) {
  const [cities, setCities] = useState<string[]>([])
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = `city-${name}`

  useEffect(() => setQuery(value), [value])
  useEffect(() => {
    let active = true
    setOpen(false)
    setActiveIndex(-1)
    if (!state) {
      setCities([])
      setQuery("")
      return
    }
    const cached = cache.get(state)
    if (cached) {
      setCities(cached)
      return
    }
    setLoading(true)
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`,
    )
      .then((response) => {
        if (!response.ok) throw new Error("IBGE indisponível")
        return response.json() as Promise<Array<{ nome: string }>>
      })
      .then((items) => {
        const names = items.map((item) => item.nome)
        cache.set(state, names)
        if (active) setCities(names)
      })
      .catch(() => {
        const names = fallbackCities[state] ?? []
        cache.set(state, names)
        if (active) setCities(names)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [state])

  const filtered = useMemo(
    () =>
      cities
        .filter((city) => normalize(city).includes(normalize(query)))
        .slice(0, 80),
    [cities, query],
  )
  const selectCity = (city: string) => {
    setQuery(city)
    onChange(city)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false)
      return
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      const direction = event.key === "ArrowDown" ? 1 : -1
      setActiveIndex((current) => {
        const next = current + direction
        if (next < 0) return filtered.length - 1
        if (next >= filtered.length) return 0
        return next
      })
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault()
      selectCity(filtered[activeIndex])
    }
  }

  return (
    <div className="field city-combobox">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        required={required}
        disabled={!state}
        value={query}
        placeholder={!state ? "Escolha o estado primeiro" : "Digite para buscar"}
        onFocus={() => state && setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          onChange("")
          setOpen(true)
          setActiveIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false)
            setQuery(value)
          }, 120)
        }}
      />
      <div className="sr-only" aria-live="polite">
        {loading
          ? "Carregando cidades"
          : open
            ? `${filtered.length} cidades encontradas`
            : value
              ? `Cidade selecionada: ${value}`
              : ""}
      </div>
      {open && (
        <div id={`${id}-list`} className="city-options" role="listbox">
          {loading ? (
            <p>Carregando cidades…</p>
          ) : filtered.length ? (
            filtered.map((city, index) => (
              <button
                id={`${id}-option-${index}`}
                key={city}
                type="button"
                role="option"
                aria-selected={city === value}
                className={index === activeIndex ? "active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCity(city)}
              >
                {city}
              </button>
            ))
          ) : (
            <p>Nenhuma cidade encontrada</p>
          )}
        </div>
      )}
    </div>
  )
}
