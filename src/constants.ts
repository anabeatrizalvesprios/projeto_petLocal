// Listas fixas usadas em vários formulários: estados (UF) e tipos de animal com seus ícones.
import { IconName } from "./Icons"

export const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export const speciesOptions: Array<{ name: string; icon: IconName }> = [
  { name: "Cachorro", icon: "dog" },
  { name: "Gato", icon: "cat" },
  { name: "Passarinho", icon: "bird" },
  { name: "Coelho", icon: "rabbit" },
  { name: "Outro", icon: "paw" },
]
