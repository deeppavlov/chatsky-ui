import cn from 'classnames'
import { ChevronRightIcon } from 'lucide-react'
import { FC, PropsWithChildren, ReactNode, useRef, useState } from 'react'

export type AccordionButtonHandler = {
  start: (id: number) => void
  stop: (id: number) => void
}
interface Props extends PropsWithChildren {
  title: string
  children: ReactNode
  infoBlock?: ReactNode
  isLoading?: boolean
}

export const StringItem = ({ content }: { content: [string, string] }) => (
  <div>
    <span className='text-sm text-input-border'>{content[0]}</span>
    <span className='text-sm'>{content[1]}</span>
  </div>
)

const Accordion: FC<Props> = ({
  title,
  children,
  infoBlock,
  isLoading,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className='w-full overflow-x-hidden' {...props}>
      {/* BUTTON */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'relative flex h-10 cursor-pointer items-center gap-1 overflow-hidden rounded-lg p-2',
          isOpen && 'bg-btn-accent',
        )}
      >
        {isLoading && (
          <div className='absolute z-0 h-full w-full animate-fill-progress bg-[#3399CC] opacity-10'></div>
        )}
        <ChevronRightIcon
          className={cn(
            'size-4 shrink-0 stroke-input-border transition-all duration-300',
            isOpen && 'rotate-90',
          )}
        />
        <span className='flex-grow truncate text-sm font-semibold sm:basis-4/6 2xl:basis-auto'>
          {title}
        </span>
        {infoBlock}
      </div>

      {/* ITEMS */}
      <div
        ref={contentRef}
        style={{
          height: isOpen ? `${contentRef.current?.scrollHeight}px` : '0',
          transition: 'height 0.3s ease',
          overflow: 'hidden',
        }}
        className='mt-1 flex flex-col overflow-hidden pe-2 ps-6'
      >
        {children}
      </div>
    </div>
  )
}

export default Accordion
