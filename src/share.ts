// Compartilhar um pet desaparecido: monta o texto, o link (que abre só aquele pet) e o arquivo da foto.
import { Pet, User } from "./data"

export type SharedPet = {
  name: string
  species: string
  breed: string
  color: string
  sex: string
  photo?: string
  city: string
  state: string
  reference: string
  seenAt: string
  notes: string
  ownerName: string
  ownerPhone: string
}

const text = (value: unknown, max = 200) => (typeof value === "string" ? value.slice(0, max) : "")

export function toSharedPet(pet: Pet, owner?: User | null): SharedPet | null {
  if (!pet.missing) return null
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    color: pet.color,
    sex: pet.sex,
    photo: pet.photo || undefined,
    city: pet.missing.city,
    state: pet.missing.state || owner?.state || "",
    reference: pet.missing.reference,
    seenAt: pet.missing.seenAt,
    notes: pet.missing.notes,
    ownerName: owner?.name ?? "",
    ownerPhone: owner?.phone ?? "",
  }
}

const toBase64Url = (value: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)))
}

/** Link que abre a tela com SOMENTE este pet. Fotos enviadas pelo tutor (muito grandes) não entram no link. */
export function shareUrl(pet: SharedPet) {
  const payload = {
    ...pet,
    notes: pet.notes.slice(0, 300),
    photo: pet.photo && /^https?:\/\//i.test(pet.photo) ? pet.photo : undefined,
  }
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#/shared?d=${toBase64Url(JSON.stringify(payload))}`
}

/** Lê o pet do link compartilhado (ou null se o link estiver quebrado). */
export function readSharedPet(): SharedPet | null {
  try {
    const query = window.location.hash.split("?")[1] ?? ""
    const raw = new URLSearchParams(query).get("d")
    if (!raw) return null
    const data = JSON.parse(fromBase64Url(raw)) as Record<string, unknown>
    const photo = text(data.photo, 2000)
    const pet: SharedPet = {
      name: text(data.name, 80),
      species: text(data.species, 40),
      breed: text(data.breed, 80),
      color: text(data.color, 80),
      sex: text(data.sex, 20),
      photo: /^https?:\/\//i.test(photo) ? photo : undefined,
      city: text(data.city, 80),
      state: text(data.state, 2),
      reference: text(data.reference, 150),
      seenAt: text(data.seenAt, 40),
      notes: text(data.notes, 300),
      ownerName: text(data.ownerName, 80),
      ownerPhone: text(data.ownerPhone, 20),
    }
    return pet.name && pet.city ? pet : null
  } catch {
    return null
  }
}

export function shareMessage(pet: SharedPet, url: string) {
  const date = pet.seenAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(pet.seenAt)) : ""
  const description = [pet.species, pet.breed, pet.color].filter(Boolean).join(", ")
  return [
    `🐾 PROCURA-SE: ${pet.name}${description ? ` (${description})` : ""}`,
    `Visto por último em ${pet.city}${pet.state ? ` – ${pet.state}` : ""}${pet.reference ? `, ${pet.reference}` : ""}${date ? ` (${date})` : ""}.`,
    pet.ownerPhone ? `Contato: ${pet.ownerName ? `${pet.ownerName}, ` : ""}${pet.ownerPhone}` : "",
    `Veja o aviso: ${url}`,
  ]
    .filter(Boolean)
    .join("\n")
}

/** Transforma a foto do pet em arquivo para ir junto no compartilhamento. Retorna null se não for possível. */
export async function photoFile(photo: string, name: string): Promise<File | null> {
  try {
    const blob = await (await fetch(photo)).blob()
    if (!blob.type.startsWith("image/")) return null
    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
    return new File([blob], `${name.replace(/[^\w-]+/g, "-") || "pet"}.${extension}`, { type: blob.type })
  } catch {
    return null
  }
}
