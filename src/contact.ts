// Atalhos de contato com o dono: link do WhatsApp (número brasileiro) com mensagem pronta.
export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "")
  const number = digits.startsWith("55") ? digits : `55${digits}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
