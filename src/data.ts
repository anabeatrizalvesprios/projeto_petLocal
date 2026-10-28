export type User = {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  salt: string
  city: string
  state: string
  reference: string
  createdAt: string
}

export type Pet = {
  id: string
  userId: string
  name: string
  species: string
  breed: string
  age: string
  sex: string
  color: string
  notes: string
  photo?: string
  hasChip?: boolean
  identifierCode?: string
  missing?: {
    city: string
    state: string
    reference: string
    seenAt: string
    notes: string
  }
  createdAt: string
}

export type LocationRecord = {
  id: string
  userId: string
  petId: string
  city: string
  state: string
  reference: string
  latitude?: number
  longitude?: number
  seenAt: string
  details: string
  createdAt: string
}

export type RegisterDraft = {
  name: string
  email: string
  phone: string
  password: string
}

const KEYS = {
  users: "petlocal_users_v1",
  pets: "petlocal_pets_v1",
  locations: "petlocal_locations_v1",
  session: "petlocal_session_v1",
}

function read<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const store = {
  users: () => read<User>(KEYS.users),
  pets: () => read<Pet>(KEYS.pets),
  locations: () => read<LocationRecord>(KEYS.locations),
  session: () => localStorage.getItem(KEYS.session),
  setSession: (id: string) => localStorage.setItem(KEYS.session, id),
  clearSession: () => localStorage.removeItem(KEYS.session),
  saveUser(user: User) {
    const users = this.users()
    const index = users.findIndex((item) => item.id === user.id)
    if (index >= 0) users[index] = user
    else users.push(user)
    write(KEYS.users, users)
  },
  savePet(pet: Pet) {
    const pets = this.pets()
    const index = pets.findIndex((item) => item.id === pet.id)
    if (index >= 0) pets[index] = pet
    else pets.push(pet)
    write(KEYS.pets, pets)
  },
  deletePet(id: string) {
    write(
      KEYS.pets,
      this.pets().filter((pet) => pet.id !== id),
    )
    write(
      KEYS.locations,
      this.locations().filter((location) => location.petId !== id),
    )
  },
  saveLocation(location: LocationRecord) {
    write(KEYS.locations, [...this.locations(), location])
  },
}

export const makeId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  )
}

export async function hashPassword(password: string, salt?: string) {
  const resolvedSalt =
    salt ?? bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const digest = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(resolvedSalt),
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )
  return {
    salt: resolvedSalt,
    hash: bytesToHex(new Uint8Array(digest)),
  }
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
