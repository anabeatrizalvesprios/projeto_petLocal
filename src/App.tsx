// Componente principal: controla as rotas, o usuário logado e os dados de pets e avisos.
import { useEffect, useRef, useState } from "react"
import { AppShell } from "./components/AppShell"
import { ConfirmDialog } from "./components/ConfirmDialog"
import { Notice, NoticeBar } from "./components/NoticeBar"
import { PublicHeader } from "./components/PublicHeader"
import { LocationRecord, Pet, RegisterDraft, store, User } from "./data"
import { ensureDemoData } from "./demoLoader"
import { AvisarDono } from "./pages/AvisarDono"
import { Avisos } from "./pages/Avisos"
import { Cadastro } from "./pages/Cadastro"
import { CadastroPrimeiroPet } from "./pages/CadastroPrimeiroPet"
import { EncontreiUmPet } from "./pages/EncontreiUmPet"
import { Entrar } from "./pages/Entrar"
import { EsqueciSenha } from "./pages/EsqueciSenha"
import { FormularioPet } from "./pages/FormularioPet"
import { MeuPerfil } from "./pages/MeuPerfil"
import { MeusPets } from "./pages/MeusPets"
import { PaginaInicial } from "./pages/PaginaInicial"
import { PainelPrincipal } from "./pages/PainelPrincipal"
import { ProcuraSe } from "./pages/ProcuraSe"
import { navigate, publicRoutes, Route, routeFromHash } from "./routes"

const routeTitles: Record<Route, string> = {
  home: "Início",
  register: "Criar conta",
  onboarding: "Cadastro do primeiro pet",
  login: "Entrar",
  forgot: "Recuperar senha",
  found: "Encontrei um pet",
  alert: "Avisar o dono",
  wanted: "Procura-se",
  dashboard: "Painel principal",
  pets: "Meus pets",
  "pet-form": "Cadastro de pet",
  location: "Avisos recebidos",
  profile: "Meu perfil",
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [user, setUser] = useState<User | null>(
    () => store.users().find((item) => item.id === store.session()) ?? null,
  )
  const [pets, setPets] = useState<Pet[]>([])
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [draft, setDraft] = useState<RegisterDraft | null>(null)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const [selectedPublicPet, setSelectedPublicPet] = useState<Pet | null>(() => {
    const selectedId = sessionStorage.getItem("petlocal_selected_pet_v1")
    return store.pets().find((pet) => pet.id === selectedId) ?? null
  })
  const [notice, setNotice] = useState<Notice>(null)
  const [, setDemoVersion] = useState(0)
  const firstRoute = useRef(true)

  // Ao trocar de tela: atualiza o título da aba e leva o foco para o título principal,
  // para que leitores de tela e quem usa teclado percebam a mudança de página.
  useEffect(() => {
    document.title = `${routeTitles[route]} · PetLocal`
    if (firstRoute.current) {
      firstRoute.current = false
      return
    }
    const timer = window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>("main h1")
      if (!heading) return
      heading.setAttribute("tabindex", "-1")
      heading.focus({ preventScroll: true })
      window.scrollTo({ top: 0 })
    }, 60)
    return () => window.clearTimeout(timer)
  }, [route])

  const refresh = (activeUser = user) => {
    if (!activeUser) return
    setPets(store.pets().filter((pet) => pet.userId === activeUser.id))
    setLocations(
      store.locations().filter((location) => location.userId === activeUser.id),
    )
  }
  useEffect(() => {
    ensureDemoData().then(() => {
      setDemoVersion((version) => version + 1)
      refresh()
    })
  }, [])
  useEffect(() => {
    const update = () => setRoute(routeFromHash())
    window.addEventListener("hashchange", update)
    if (!window.location.hash) navigate(user ? "dashboard" : "home")
    return () => window.removeEventListener("hashchange", update)
  }, [])
  useEffect(() => {
    refresh()
  }, [user])
  useEffect(() => {
    if (!user && !publicRoutes.includes(route)) navigate("login")
    if (
      user &&
      publicRoutes.includes(route) &&
      route !== "home" &&
      route !== "register" &&
      route !== "forgot" &&
      route !== "found" &&
      route !== "wanted" &&
      route !== "alert"
    )
      navigate("dashboard")
  }, [route, user])

  const login = (activeUser: User) => {
    setUser(activeUser)
    navigate("dashboard")
    setNotice({
      type: "success",
      text: `Bem-vindo, ${activeUser.name.split(" ")[0]}!`,
    })
  }
  const logout = () => {
    store.clearSession()
    setUser(null)
    setPets([])
    setLocations([])
    navigate("home")
  }
  const complete = (activeUser: User) => {
    setDraft(null)
    sessionStorage.removeItem("petlocal_register_draft_v1")
    setUser(activeUser)
    navigate("dashboard")
    setNotice({
      type: "success",
      text: "Conta criada com sucesso. Seu primeiro pet já está cadastrado!",
    })
  }
  const savePet = (pet: Pet) => {
    const before = pets.find((item) => item.id === pet.id)
    const wasFound = Boolean(before?.missing) && !pet.missing
    const wasLost = !before?.missing && Boolean(pet.missing)
    store.savePet(pet)
    // Pet encontrado: os avisos dele deixam de ser "novos"
    if (wasFound) store.markPetLocationsSeen(pet.id)
    refresh()
    setEditingPet(null)
    navigate("pets")
    setNotice({
      type: "success",
      text: wasFound
        ? `${pet.name} foi marcado como encontrado. Os avisos dele foram movidos para “Vistos”.`
        : wasLost
          ? `Aviso “Procura-se” de ${pet.name} criado com sucesso.`
          : `${pet.name} foi ${before ? "atualizado" : "cadastrado"} com sucesso.`,
    })
  }
  const setLocationSeen = (id: string, seen: boolean) => {
    store.setLocationSeen(id, seen)
    refresh()
  }
  const deletePet = () => {
    if (!deletingPet) return
    const name = deletingPet.name
    store.deletePet(deletingPet.id)
    setDeletingPet(null)
    refresh()
    setNotice({ type: "success", text: `${name} foi excluído com sucesso.` })
  }
  const saveLocation = (location: LocationRecord) => {
    store.saveLocation(location)
    refresh()
    setNotice({ type: "success", text: "Localização registrada com sucesso." })
  }
  const saveUser = (updated: User) => {
    store.saveUser(updated)
    setUser(updated)
    setNotice({ type: "success", text: "Perfil atualizado com sucesso." })
  }
  const openAlert = (pet: Pet) => {
    // Guarda de qual tela a pessoa veio (Procura-se ou Encontrei um pet) para o botão "Voltar" da próxima tela.
    sessionStorage.setItem(
      "petlocal_alert_origin_v1",
      route === "wanted" ? "wanted" : "found",
    )
    sessionStorage.setItem("petlocal_selected_pet_v1", pet.id)
    setSelectedPublicPet(pet)
    navigate("alert")
  }

  const alertOrigin: Route =
    sessionStorage.getItem("petlocal_alert_origin_v1") === "wanted"
      ? "wanted"
      : "found"
  let content: React.ReactNode
  if (route === "home") content = <PaginaInicial />
  else if (route === "register") content = <Cadastro onDraft={setDraft} />
  else if (route === "onboarding")
    content = <CadastroPrimeiroPet draft={draft} onComplete={complete} />
  else if (route === "login") content = <Entrar onLogin={login} />
  else if (route === "forgot") content = <EsqueciSenha />
  else if (route === "found")
    content = user ? (
      <AppShell route="found" user={user} onLogout={logout}>
        <EncontreiUmPet onAlert={openAlert} showHeader={false} />
      </AppShell>
    ) : (
      <EncontreiUmPet onAlert={openAlert} />
    )
  else if (route === "alert")
    content = user ? (
      <AppShell route={alertOrigin} user={user} onLogout={logout}>
        <AvisarDono
          pet={selectedPublicPet}
          showHeader={false}
          onSave={(location) => {
            store.saveLocation(location)
            refresh()
          }}
        />
      </AppShell>
    ) : (
      <AvisarDono
        pet={selectedPublicPet}
        onSave={(location) => {
          store.saveLocation(location)
          refresh()
        }}
      />
    )
  else if (route === "wanted")
    content = user ? (
      <AppShell route="wanted" user={user} onLogout={logout}>
        <ProcuraSe onAlert={openAlert} />
      </AppShell>
    ) : (
      <>
        <PublicHeader />
        <main className="public-wanted-main">
          <ProcuraSe onAlert={openAlert} />
        </main>
      </>
    )
  else if (!user) content = null
  else if (route === "pet-form")
    content = (
      <AppShell route="pets" user={user} onLogout={logout}>
        <FormularioPet
          existing={editingPet}
          userId={user.id}
          onSave={savePet}
          onCancel={() => {
            setEditingPet(null)
            navigate("pets")
          }}
        />
      </AppShell>
    )
  else {
    const page =
      route === "dashboard" ? (
        <PainelPrincipal user={user} pets={pets} locations={locations} />
      ) : route === "pets" ? (
        <MeusPets
          pets={pets}
          onEdit={(pet) => {
            setEditingPet(pet)
            navigate("pet-form")
          }}
          onDelete={setDeletingPet}
          onUpdatePet={savePet}
        />
      ) : route === "location" ? (
        <Avisos pets={pets} locations={locations} onSetSeen={setLocationSeen} />
      ) : (
        <MeuPerfil user={user} onSave={saveUser} />
      )
    content = (
      <AppShell route={route} user={user} onLogout={logout}>
        {page}
      </AppShell>
    )
  }
  return (
    <>
      <NoticeBar notice={notice} clear={() => setNotice(null)} />
      {content}
      {deletingPet && (
        <ConfirmDialog
          title={`Excluir ${deletingPet.name}?`}
          text="Os dados do pet e todo o histórico de localizações serão removidos deste dispositivo. Esta ação não pode ser desfeita."
          confirmLabel="Sim, excluir"
          onConfirm={deletePet}
          onCancel={() => setDeletingPet(null)}
        />
      )}
    </>
  )
}
