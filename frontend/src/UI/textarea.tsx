import { cn } from '@/lib/utils'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as React from 'react'

const defaultClassName =
  'flex w-full min-h-[160px] rounded-xl border-2 border-neutral-600 hover:border-neutral-400 bg-transparent px-[14px] py-[10px] text-base \
  ring-offset-white placeholder:text-foreground-400 disabled:cursor-not-allowed disabled:opacity-70 md:text-sm resize-none \
  focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:border-neutral-800'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string
  labelPlacement?: 'outside' | 'inside' | 'outside-left' | undefined
  isError?: boolean
  errorMessage?: string
  errorTooltip?: boolean
  minRows?: number
  maxRows?: number
  variant?: 'bordered' | 'unbordered'
}

const Textarea2 = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label = '',
      labelPlacement = 'outside',
      isError = false,
      errorMessage,
      errorTooltip = false,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useImperativeHandle(
      ref,
      () => textareaRef.current as HTMLTextAreaElement,
    )

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(scrollHeight, 300)
      textarea.style.height = `${newHeight}px`

      // Управляем скроллом
      if (scrollHeight <= 300) {
        textarea.style.overflowY = 'hidden'
      } else {
        textarea.style.overflowY = 'auto'
      }
    }, [])

    React.useEffect(() => {
      window.addEventListener('resize', adjustHeight)
      return () => window.removeEventListener('resize', adjustHeight)
    }, [adjustHeight])

    React.useEffect(() => {
      adjustHeight()
    }, [adjustHeight])

    return (
      <>
        {labelPlacement === 'outside' && (
          <div className='flex items-center justify-between gap-2'>
            <p className='px-2 py-2 text-small'>{label}</p>
            {errorTooltip && (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <ExclamationTriangleIcon
                      color='red'
                      className='my-[8px] mr-[10px] h-[16px] w-[16px]'
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className='TooltipContent z-[9999] rounded-md bg-foreground px-[8px] py-[4px] text-sm text-background'
                      sideOffset={5}
                      side='bottom'
                      align='end'
                      data-state='open'
                    >
                      {errorMessage}
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </div>
        )}
        <div className='flex items-center gap-2'>
          {labelPlacement === 'outside-left' && (
            <p className='text-xs'>{label}</p>
          )}
          <div className='relative flex w-full'>
            <textarea
              ref={textareaRef}
              className={cn(
                defaultClassName,
                className,
                labelPlacement === 'inside' && 'pt-10',
                isError &&
                  'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/20',
              )}
              onInput={adjustHeight}
              {...props}
            />
            {labelPlacement === 'inside' && (
              <p className='pointer-events-none absolute left-3 top-2 text-xs'>
                {label}
              </p>
            )}
          </div>
        </div>
        {isError && !errorTooltip && (
          <p className='pl-2 pt-1 text-xs text-red-500'>{errorMessage}</p>
        )}
      </>
    )
  },
)
Textarea2.displayName = 'Textarea2'

export { Textarea2 }
