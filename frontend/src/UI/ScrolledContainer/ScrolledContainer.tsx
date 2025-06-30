import React, {
  forwardRef,
  ReactNode,
  RefObject,
  useLayoutEffect,
  useRef,
} from 'react'
import './ScrolledContainer.css'
import cn from 'classnames'

interface ScrolledContainerProps extends React.PropsWithChildren {
  children: ReactNode
  className?: string
  scrollbarOffset?: string
  scrollbarPadding?: string
}

const ScrolledContainer = forwardRef<HTMLDivElement, ScrolledContainerProps>(
  (
    { children, className, scrollbarOffset = '0', scrollbarPadding = '0' },
    ref,
  ) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const containerRef = (ref || innerRef) as RefObject<HTMLDivElement>
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
        resizeObserver.disconnect()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children])

    return (
      <div className={cn('flex max-h-full w-full', className)}>
        <div
          ref={containerRef}
          style={
            {
              '--offset': scrollbarOffset,
              '--padding': scrollbarPadding,
            } as React.CSSProperties
          }
          className='scrolled_container flex-grow overflow-y-auto'
        >
          {children}
        </div>
      </div>
    )
  },
)

export default ScrolledContainer
