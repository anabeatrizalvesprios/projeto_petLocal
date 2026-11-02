// Validação de formulários com mensagens em português, claras e específicas.
// Os formulários usam noValidate: em vez do balão padrão do navegador, o campo com problema
// recebe aria-invalid, o foco vai até ele e a mensagem aparece em um aviso (role="alert").

const labelOf = (el: HTMLElement) => {
  if (el.dataset.label) return el.dataset.label
  const id = el.id
  let text = ""
  if (id) text = document.querySelector(`label[for="${id}"]`)?.textContent ?? ""
  if (!text) {
    // Grupos de botões de opção (espécie, chip): usa a legenda ou o rótulo do grupo
    const group = el.closest("fieldset, [role=radiogroup]")
    const legendId = group?.getAttribute("aria-labelledby")
    text =
      (legendId && document.getElementById(legendId)?.textContent) ||
      group?.querySelector("legend")?.textContent ||
      ""
  }
  return text
    .replace(/\*/g, "")
    .replace(/\(opcional\)/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

export const digitsOnly = (value: string) => value.replace(/\D/g, "")

export function formatPhone(value: string) {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ""
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const isValidPhone = (value: string) => {
  const d = digitsOnly(value)
  return d.length === 10 || d.length === 11
}

function messageFor(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (el.dataset.errorMessage) return el.dataset.errorMessage
  const label = labelOf(el)
  const kind = el.getAttribute("type")
  const isChoice = el.tagName === "SELECT" || kind === "radio"
  if (el.validity.valueMissing)
    return isChoice
      ? `Escolha uma opção em “${label}”.`
      : `Preencha o campo “${label}”.`
  if (kind === "email" && el.validity.typeMismatch)
    return "Informe um e-mail válido, como voce@exemplo.com."
  if (el.validity.tooShort)
    return `O campo “${label}” precisa ter pelo menos ${(el as HTMLInputElement).minLength} caracteres.`
  return `Confira o campo “${label}”.`
}

export const ERROR_ID = "form-error"

/** Marca o campo como inválido e liga-o à mensagem de erro (aria-describedby). */
export function markInvalid(el: HTMLElement) {
  el.setAttribute("aria-invalid", "true")
  const ids = (el.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean)
  if (!ids.includes(ERROR_ID)) ids.push(ERROR_ID)
  el.setAttribute("aria-describedby", ids.join(" "))
}

/**
 * Leva o foco para a mensagem de erro no início do formulário (o leitor de tela a lê na hora).
 * Também é chamada aqui porque, se a mensagem for igual à anterior, a tela não muda e o foco não iria.
 */
export function focusFormError() {
  window.setTimeout(() => {
    const message = document.querySelector<HTMLElement>('[role="alert"]')
    if (!message) return
    message.setAttribute("tabindex", "-1")
    message.focus()
  }, 80)
}

/** Desfaz a marcação de erro, mantendo a dica (hint) original do campo. */
export function clearInvalid(el: HTMLElement) {
  el.removeAttribute("aria-invalid")
  const ids = (el.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter((id) => id && id !== ERROR_ID)
  if (ids.length) el.setAttribute("aria-describedby", ids.join(" "))
  else el.removeAttribute("aria-describedby")
}

export function flagField(id: string) {
  const el = document.getElementById(id)
  if (el) markInvalid(el)
  focusFormError()
}

/**
 * Valida o formulário e destaca TODOS os campos com problema (não só o primeiro).
 * Retorna a mensagem do erro (ou null se estiver tudo certo) e leva o foco para essa mensagem.
 */
export function validateForm(form: HTMLFormElement): string | null {
  form.querySelectorAll<HTMLElement>("[aria-invalid]").forEach(clearInvalid)
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  )
  const labels: string[] = []
  const groups = new Set<string>()
  let firstMessage = ""
  for (const el of fields) {
    if (el.disabled) continue
    let message = ""
    if (el.dataset.kind === "phone" && el.value && !isValidPhone(el.value))
      message = "Informe o telefone com DDD, por exemplo (18) 99999-9999."
    else if (!el.checkValidity()) message = messageFor(el)
    if (!message) continue
    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (groups.has(el.name)) continue
      groups.add(el.name)
      form
        .querySelectorAll<HTMLInputElement>(`input[type=radio][name="${el.name}"]`)
        .forEach(markInvalid)
    } else markInvalid(el)
    labels.push(labelOf(el))
    firstMessage ||= message
  }
  if (!labels.length) return null
  focusFormError()
  if (labels.length === 1) return firstMessage
  const list = labels.length > 2 ? `${labels.slice(0, -1).join(", ")} e ${labels.at(-1)}` : labels.join(" e ")
  return `Confira os ${labels.length} campos destacados em vermelho: ${list}.`
}
