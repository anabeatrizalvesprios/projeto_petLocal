// Tela de entrar com e-mail e senha.
import { FormEvent, useState } from "react"
import { Icon } from "../Icons"
import { AuthLayout } from "../components/AuthLayout"
import { Field } from "../components/Field"
import { flagField, validateForm } from "../formValidation"
import { hashPassword, normalizeEmail, store, User } from "../data"
import { ensureDemoData } from "../demoLoader"
import { navigate } from "../routes"

export function Entrar({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    setBusy(true)
    await ensureDemoData()
    const user = store
      .users()
      .find((item) => item.email === normalizeEmail(email))
    if (!user) {
      setBusy(false)
      flagField("field-login-email")
      return setError(
        "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      )
    }
    const { hash } = await hashPassword(password, user.salt)
    setBusy(false)
    if (hash !== user.passwordHash) {
      flagField("field-login-password")
      return setError(
        "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      )
    }
    store.setSession(user.id)
    onLogin(user)
  }
  return (
    <AuthLayout
      title="Que bom ter você de volta"
      subtitle="Entre para acessar os dados dos seus pets."
    >
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form onSubmit={submit} noValidate>
        <Field
          label="E-mail"
          name="login-email"
          type="email"
          required
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Senha"
          name="login-password"
          type="password"
          required
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <button
          className="forgot-link"
          type="button"
          onClick={() => navigate("forgot")}
        >
          Esqueci minha senha
        </button>
        <button className="button full" type="submit" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"} <Icon name="arrow" />
        </button>
      </form>
      <p className="auth-switch">
        Ainda não tem conta?{" "}
        <button onClick={() => navigate("register")}>Criar conta</button>
      </p>
    </AuthLayout>
  )
}
