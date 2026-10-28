// Validação de formulários com mensagens em português, claras e específicas.
// Os formulários usam noValidate: em vez do balão padrão do navegador, o campo com problema
// recebe aria-invalid, o foco vai até ele e a mensagem aparece em um aviso (role="alert").

const labelOf = (el: HTMLElement) => {
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

/** Marca o campo como inválido e leva o foco até ele. */
export function flagField(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.setAttribute("aria-invalid", "true")
  el.focus()
}

/**
 * Valida o formulário. Retorna a mensagem do primeiro problema (e já
 * leva o foco para o campo) ou null se estiver tudo certo.
 */
export function validateForm(form: HTMLFormElement): string | null {
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"))
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  )
  for (const el of fields) {
    if (el.disabled) continue
    if (el.dataset.kind === "phone" && el.value && !isValidPhone(el.value)) {
      el.setAttribute("aria-invalid", "true")
      el.focus()
      return "Informe o telefone com DDD, por exemplo (18) 99999-9999."
    }
    if (!el.checkValidity()) {
      const target =
        el.type === "radio"
          ? (form.querySelector<HTMLInputElement>(`input[type=radio][name="${el.name}"]`) ?? el)
          : el
      target.setAttribute("aria-invalid", "true")
      target.focus()
      return messageFor(el)
    }
  }
  return null
}
