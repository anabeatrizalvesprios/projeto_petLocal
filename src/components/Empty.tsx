// Bloco mostrado quando não há nada para listar (estado vazio).
import { Icon } from "../Icons"

export function Empty({
  icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: "pets" | "pin"
  title: string
  text: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="empty">
      <span>
        <Icon name={icon} size={34} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
      <button className="text-link" onClick={onAction}>
        {action} <Icon name="arrow" size={17} />
      </button>
    </div>
  )
}
