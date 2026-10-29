// Botão para alternar entre tema claro e escuro (o texto diz a ação que será feita).
import { Icon } from "../Icons"
import { useTheme } from "../theme"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const toDark = theme === "light"
  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={toggle}>
      <Icon name={toDark ? "moon" : "sun"} size={19} />
      {toDark ? "Tema escuro" : "Tema claro"}
    </button>
  )
}
