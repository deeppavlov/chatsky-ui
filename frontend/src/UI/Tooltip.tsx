import {
  TooltipContent,
  TooltipPortal,
  Tooltip as TooltipRoot,
  TooltipTrigger,
} from '@radix-ui/react-tooltip'
import cn from 'classnames'
import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  classNames?: { trigger?: string; content?: string }
  isPortal?: boolean
}

export const Tooltip = ({
  children,
  content,
  side,
  align,
  sideOffset,
  alignOffset,
  classNames,
  isPortal,
}: IProps) => {
  return (
    <TooltipRoot>
      <TooltipTrigger
        className={cn('flex items-center justify-center', classNames?.trigger)}
      >
        {children}
      </TooltipTrigger>

      {isPortal ? (
        <TooltipPortal>
          <TooltipContent
            className={cn(
              'z-[9999] rounded-md border border-border bg-background px-2 py-1 text-xs shadow-md',
              classNames?.content,
            )}
            side={side ?? 'top'}
            sideOffset={sideOffset}
            align={align ?? 'center'}
            alignOffset={alignOffset}
          >
            {content}
          </TooltipContent>
        </TooltipPortal>
      ) : (
        <TooltipContent
          className={cn(
            'z-[9999] rounded-md border border-border bg-background px-2 py-1 text-xs shadow-md',
            classNames?.content,
          )}
          side={side ?? 'top'}
          sideOffset={sideOffset}
          align={align ?? 'center'}
          alignOffset={alignOffset}
        >
          {content}
        </TooltipContent>
      )}
    </TooltipRoot>
  )
}
