import { hashPassword, Pet, store, User } from "./data"

const photos = {
  luna: "https://images.unsplash.com/photo-1662261665196-5f061465f70d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
  bob: "https://images.unsplash.com/photo-1617798087281-c1a1b8784ce9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
  max: "https://images.unsplash.com/photo-1663867335435-370136fb2c22?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
  mel: "https://images.unsplash.com/photo-1760305140552-e0f768b8ccd9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
  nina: "https://images.unsplash.com/photo-1773683068346-a2bca9f5f666?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
  thor: "https://images.unsplash.com/photo-1692700695122-5c2af61082a4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=900&h=700",
}

export const DEMO_WANTED_ADS = [
  { id: "demo-wanted-luna", ownerId: "demo-owner-ana", owner: "Ana Souza", phone: "(18) 99911-2233", city: "Birigui", state: "SP", reference: "Praça Dr. Gama", name: "Luna", species: "Gato", breed: "Siamês", color: "Creme e marrom", sex: "Fêmea", photo: photos.luna },
  { id: "demo-wanted-max", ownerId: "demo-owner-carlos", owner: "Carlos Lima", phone: "(18) 99822-3344", city: "Birigui", state: "SP", reference: "Próximo ao Parque do Povo", name: "Max", species: "Cachorro", breed: "SRD", color: "Preto e branco", sex: "Macho", photo: photos.max },
  { id: "demo-wanted-mel", ownerId: "demo-owner-julia", owner: "Júlia Alves", phone: "(11) 99733-4455", city: "Campinas", state: "SP", reference: "Lagoa do Taquaral", name: "Mel", species: "Cachorro", breed: "Poodle", color: "Branco", sex: "Fêmea", photo: photos.mel },
  { id: "demo-wanted-nina", ownerId: "demo-owner-rafael", owner: "Rafael Costa", phone: "(21) 99644-5566", city: "Niterói", state: "RJ", reference: "Campo de São Bento", name: "Nina", species: "Gato", breed: "SRD", color: "Branca e laranja", sex: "Fêmea", photo: photos.nina },
] as const

export async function ensureDemoData() {
  const users = store.users()
  let testUser = users.find((user) => user.email === "teste@petlocal.com")
  if (!testUser) {
    const secured = await hashPassword("Teste@1234")
    testUser = {
      id: "test-user-maria",
      name: "Maria Teste",
      email: "teste@petlocal.com",
      phone: "(18) 99999-1234",
      passwordHash: secured.hash,
      salt: secured.salt,
      city: "Birigui",
      state: "SP",
      reference: "",
      createdAt: new Date().toISOString(),
    }
    store.saveUser(testUser)
  }

  const testPets: Pet[] = [
    { id: "test-pet-bob", userId: testUser.id, name: "Bob", species: "Cachorro", breed: "SRD", age: "3 anos", sex: "Macho", color: "Marrom", notes: "Dócil e usa coleira azul.", photo: photos.bob, hasChip: false, identifierCode: "PET-BOB123", createdAt: new Date().toISOString() },
    { id: "test-pet-luna", userId: testUser.id, name: "Mimi", species: "Gato", breed: "SRD", age: "2 anos", sex: "Fêmea", color: "Branca e cinza", notes: "", photo: photos.luna, hasChip: false, identifierCode: "PET-MIMI456", createdAt: new Date().toISOString() },
    { id: "test-pet-thor", userId: testUser.id, name: "Thor", species: "Cachorro", breed: "Labrador", age: "5 anos", sex: "Macho", color: "Caramelo", notes: "", photo: photos.thor, hasChip: true, identifierCode: "985141000123456", createdAt: new Date().toISOString() },
  ]
  const existingPets = store.pets()
  testPets.forEach((pet) => {
    if (!existingPets.some((item) => item.id === pet.id)) store.savePet(pet)
  })

  DEMO_WANTED_ADS.forEach((ad, index) => {
    if (!store.users().some((user) => user.id === ad.ownerId)) {
      const owner: User = {
        id: ad.ownerId, name: ad.owner, email: `demo${index}@petlocal.local`,
        phone: ad.phone, passwordHash: "conta-demonstrativa", salt: "demo",
        city: ad.city, state: ad.state, reference: "", createdAt: new Date().toISOString(),
      }
      store.saveUser(owner)
    }
    if (!store.pets().some((pet) => pet.id === ad.id)) {
      store.savePet({
        id: ad.id, userId: ad.ownerId, name: ad.name, species: ad.species,
        breed: ad.breed, age: "", sex: ad.sex, color: ad.color,
        notes: "Anúncio demonstrativo.", photo: ad.photo, hasChip: false,
        identifierCode: `DEMO-${index + 1}`,
        missing: {
          city: ad.city, state: ad.state, reference: ad.reference,
          seenAt: new Date(Date.now() - (index + 1) * 86_400_000).toISOString(),
          notes: "",
        },
        createdAt: new Date().toISOString(),
      })
    }
  })
}
