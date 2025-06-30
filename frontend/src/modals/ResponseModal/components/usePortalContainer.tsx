import { useEffect, useRef, useState } from 'react'

/**
 * Создаёт контейнер внутри компонента и отдаёт ref и actual DOM-элемент
 * Можно использовать для контроля порталов (например, в Select, Tooltip и др.)
 * используется для работы nextui селекта в radixui модалке
 */
export const usePortalContainer = <
  T extends HTMLElement = HTMLDivElement,
>() => {
  const ref = useRef<T>(null)
  const [portalContainer, setPortalContainer] = useState<T | null>(null)

  useEffect(() => {
    if (ref.current) {
      setPortalContainer(ref.current)
    }
  }, [])

  return { ref, portalContainer }
}
