import React, { ReactNode, useLayoutEffect, useRef } from 'react'
import './ScrolledContainer.css'
import cn from 'classnames'

interface ScrolledContainerProps extends React.PropsWithChildren {
  children: ReactNode
  className?: string
}

const ScrolledContainer: React.FC<ScrolledContainerProps> = ({
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasScrollbarRef = useRef(false)

  const handleResize = () => {
    if (containerRef.current) {
      const hasScrollbar =
        containerRef.current.scrollHeight > containerRef.current.clientHeight
      hasScrollbarRef.current = hasScrollbar

      // Принудительное обновление класса "hasScrollbar" в DOM
      if (
        containerRef.current.classList.contains('hasScrollbar') &&
        !hasScrollbar
      ) {
        containerRef.current.classList.remove('hasScrollbar')
      } else if (
        !containerRef.current.classList.contains('hasScrollbar') &&
        hasScrollbar
      ) {
        containerRef.current.classList.add('hasScrollbar')
      }
    }
  }

  useLayoutEffect(() => {
    handleResize() // Проверяем скроллбар при монтировании

    // Наблюдатель за изменением размеров контейнера и его содержимого
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    if (containerRef.current) {
      // resizeObserver.observe(containerRef.current.children[0])
      Array.from(containerRef.current.children).forEach((child) => {
        resizeObserver.observe(child)
      })
    }

    return () => {
      resizeObserver.disconnect() // Очистка наблюдателя при размонтировании
    }
  }, [children])

  return (
    <div className={cn('flex max-h-full w-full', className)}>
      <div
        ref={containerRef}
        className='scrolled_container flex-grow overflow-y-auto'
      >
        {children}
      </div>
    </div>
  )
}

export default ScrolledContainer
