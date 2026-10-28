// Tela de criar conta (primeira etapa do cadastro).
import { FormEvent, useState } from "react"
import { Icon } from "../Icons"
import { AuthLayout } from "../components/AuthLayout"
import { Field } from "../components/Field"
import { flagField, validateForm } from "../formValidation"
import { normalizeEmail, RegisterDraft, store } from "../data"
import { navigate } from "../routes"

export function Cadastro({ onDraft }: { onDraft: (draft: RegisterDraft) => void }) {
  // Se a página for atualizada, nome, e-mail e telefone são recuperados (a senha nunca é guardada).
  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("petlocal_register_draft_v1") ?? "{}")
    } catch {
      return {}
    }
  })()
  const [form, setForm] = useState({
    name: (saved.name as string) ?? "",
    email: (saved.email as string) ?? "",
    phone: (saved.phone as string) ?? "",
    password: "",
    confirm: "",
  })
  const [error, setError] = useState("")
  const fail = (id: string, message: string) => {
    flagField(`field-${id}`)
    setError(message)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    if (form.name.trim().split(/\s+/).length < 2)
      return fail("name", "Informe seu nome e sobrenome.")
    if (store.users().some((user) => user.email === normalizeEmail(form.email)))
      return fail(
        "email",
        "Este e-mail já está cadastrado. Tente entrar na sua conta.",
      )
    if (
      form.password.length < 8 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password)
    )
      return fail(
        "password",
        "A senha deve ter ao menos 8 caracteres, com letras e números.",
      )
    if (form.password !== form.confirm)
      return fail("confirm", "As senhas não coincidem. Digite novamente.")
    sessionStorage.setItem(
      "petlocal_register_draft_v1",
      JSON.stringify({
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        phone: form.phone.trim(),
      }),
    )
    onDraft({
      name: form.name.trim(),
      email: normalizeEmail(form.email),
      phone: form.phone.trim(),
      password: form.password,
    })
    navigate("onboarding")
  }
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Primeiro, conte um pouco sobre você."
    >
      <div className="steps" role="group" aria-label="Etapa 1 de 2: Conta">
        <span className="active">1</span>
        <i />
        <span>2</span>
        <small>Conta</small>
        <small>Você e seu pet</small>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form onSubmit={submit} noValidate>
        <Field
          label="Nome completo"
          name="name"
          required
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          autoComplete="name"
          placeholder="Como você quer ser chamado?"
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Telefone"
          name="phone"
          type="tel"
          mask="phone"
          required
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          hint="Com DDD. Este número aparece para quem encontrar seu pet, para que possa ligar para você."
        />
        <div className="form-grid">
          <Field
            label="Senha"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            autoComplete="new-password"
            minLength={8}
            hint="Mínimo de 8 caracteres, com letras e números."
          />
          <Field
            label="Confirmar senha"
            name="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={(confirm) => setForm({ ...form, confirm })}
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <button className="button full" type="submit">
          Continuar <Icon name="arrow" />
        </button>
      </form>
      <p className="auth-switch">
        Já tem uma conta?{" "}
        <button onClick={() => navigate("login")}>Entrar</button>
      </p>
    </AuthLayout>
  )
}
