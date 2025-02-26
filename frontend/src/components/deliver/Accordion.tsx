import { FC, PropsWithChildren, ReactNode, useRef, useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import cn from "classnames"

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
    <span className='text-input-border text-sm'>{content[0]}</span>
    <span className='text-sm'>{content[1]}</span>
  </div>
)

const Accordion: FC<Props> = ({ title, children, infoBlock, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className='w-full overflow-x-hidden'>
      {/* BUTTON */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-2 rounded-lg flex items-center gap-1 cursor-pointer h-10 overflow-hidden",
          isOpen && "bg-btn-accent"
        )}
      >
        {isLoading && (
          <div className='absolute bg-[#3399CC] w-full h-full animate-fill-progress opacity-10 z-0'></div>
        )}
        <ChevronRightIcon
          className={cn(
            "size-4 transition-all duration-300 stroke-input-border",
            isOpen && "rotate-90"
          )}
        />
        <span className='text-sm font-semibold flex-grow truncate sm:basis-4/6 2xl:basis-auto'>
          {title}
        </span>
        {infoBlock}
      </div>

      {/* ITEMS */}
      <div
        ref={contentRef}
        style={{
          height: isOpen ? `${contentRef.current?.scrollHeight}px` : "0",
          transition: "height 0.3s ease",
          overflow: "hidden",
        }}
        className='overflow-hidden px-6 flex flex-col mt-1'
      >
        {children}
      </div>
    </div>
  )
}

export default Accordion
