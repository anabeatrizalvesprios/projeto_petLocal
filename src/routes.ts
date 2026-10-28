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

export const publicRoutes: Route[] = [
  "home",
  "register",
  "onboarding",
  "login",
  "forgot",
  "found",
  "alert",
  "wanted",
]

export function routeFromHash(): Route {
  const value = window.location.hash.replace("#/", "") as Route
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
