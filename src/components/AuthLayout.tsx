// Moldura das telas de conta: cadastro, entrar e esqueci a senha.
import { Icon } from "../Icons"
import { PublicHeader } from "./PublicHeader"
import { BackHome } from "./BackHome"

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <>
    <PublicHeader />
    <div className="auth-page">
      <div className="auth-brand" role="complementary" aria-label="Sobre o PetLocal">
        <div className="auth-illustration">
          <span>
            <Icon name="heart" size={35} />
          </span>
          <Icon name="paw" size={92} />
        </div>
        <h2>
          Cuidado e segurança
          <br />
          em cada passo.
        </h2>
        <p>
          Um espaço simples para manter as informações do seu melhor amigo
          sempre por perto.
        </p>
      </div>
      <main className="auth-main">
        <BackHome />
        <div className="auth-card">
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
    </>
  )
}
