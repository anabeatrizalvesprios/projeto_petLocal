// Tela de recuperar a senha.
import { useState } from "react"
import { Icon } from "../Icons"
import { AuthLayout } from "../components/AuthLayout"
import { Field } from "../components/Field"
import { validateForm } from "../formValidation"
import { navigate } from "../routes"

export function EsqueciSenha() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Esta é uma demonstração: nenhum e-mail será enviado."
    >
      {sent ? (
        <div className="success-panel" role="status">
          <span>
            <Icon name="mail" size={30} />
          </span>
          <h2>Solicitação demonstrada</h2>
          <p>
            Se existisse uma conta para <strong>{email}</strong>, as instruções
            apareceriam no e-mail. Neste protótipo local, nenhum envio é
            realizado.
          </p>
          <button className="button full" onClick={() => navigate("login")}>
            Voltar para entrar
          </button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const problem = validateForm(event.currentTarget)
            if (problem) return setError(problem)
            setError("")
            setSent(true)
          }}
        >
          {error && (
            <p className="inline-error" role="alert">
              <Icon name="warning" size={18} /> {error}
            </p>
          )}
          <Field
            label="E-mail cadastrado"
            name="recovery-email"
            type="email"
            required
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
          <p className="info-box">
            <Icon name="shield" size={20} /> Por segurança, não informamos se o
            e-mail está cadastrado.
          </p>
          <button className="button full" type="submit">
            Demonstrar recuperação <Icon name="arrow" />
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
