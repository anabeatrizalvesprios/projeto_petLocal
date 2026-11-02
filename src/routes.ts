// Rotas do app: nomes das telas, quais são públicas e funções para navegar entre elas.


export type Route =
  | "home"
  | "register"
  | "onboarding"
  | "login"
  | "forgot"
  | "found"
  | "alert"
  | "wanted"
  | "dashboard"
  | "pets"
  | "pet-form"
  | "location"
  | "profile"
  | "shared"

export const publicRoutes: Route[] = [
  "home",
  "register",
  "onboarding",
  "login",
  "forgot",
  "found",
  "alert",
  "wanted",
  "shared",
]

export function routeFromHash(): Route {
  const value = window.location.hash.replace("#/", "").split("?")[0] as Route
  return [
    "home",
    "register",
    "onboarding",
    "login",
    "forgot",
    "found",
    "alert",
    "wanted",
    "dashboard",
    "pets",
    "pet-form",
    "location",
    "profile",
    "shared",
  ].includes(value)
    ? value
    : "home"
}

export function navigate(route: Route) {
  window.location.hash = `/${route}`
}

export function openFoundSearch(reset = false) {
  if (reset) {
    sessionStorage.removeItem("petlocal_last_search_code")
    window.dispatchEvent(new Event("petlocal:reset-search"))
  }
  navigate("found")
}
