// Campo de foto do pet, opcional, com pré-visualização.
import { useState } from "react"

export function PhotoField({
  petName,
  photo,
  onChange,
}: {
  petName: string
  photo: string
  onChange: (photo: string) => void
}) {
  const [error, setError] = useState("")
  const handleFile = (file?: File) => {
    setError("")
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem, como JPG ou PNG.")
      return
    }
    if (file.size > 1_500_000) {
      setError("A imagem deve ter no máximo 1,5 MB. Escolha uma foto menor.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.onerror = () =>
      setError("Não foi possível abrir a imagem. Escolha outra foto.")
    reader.readAsDataURL(file)
  }
  return (
    <div className="field photo-field">
      <label htmlFor="pet-photo">
        Foto do pet <span className="optional-label">(opcional)</span>
      </label>
      <input
        id="pet-photo"
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files?.[0])}
        aria-describedby={error ? "pet-photo-error" : "pet-photo-hint"}
      />
      <small id="pet-photo-hint">JPG ou PNG de até 1,5 MB.</small>
      {error && (
        <p id="pet-photo-error" className="field-error" role="alert">
          {error}
        </p>
      )}
      {photo && (
        <div className="photo-preview">
          <img
            src={photo}
            alt={`Pré-visualização da foto de ${petName || "seu pet"}`}
          />
          <button
            className="button secondary"
            type="button"
            onClick={() => onChange("")}
          >
            Remover foto
          </button>
        </div>
      )}
    </div>
  )
}
