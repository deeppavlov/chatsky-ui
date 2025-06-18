import { Tooltip } from '@/UI/Tooltip'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import cn from 'classnames'
import * as React from 'react'

const defaultClassName =
  'flex w-full min-h-[160px] rounded-xl border-2 border-foreground-200 hover:border-foreground-400 bg-transparent px-[14px] py-[10px] text-base \
   placeholder:text-foreground-400 disabled:cursor-not-allowed disabled:opacity-70 md:text-sm resize-none \
  focus:outline-none focus:ring-foreground-400 focus:border-foreground-600'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string
  labelPlacement?: 'outside' | 'inside' | 'outside-left' | undefined
  isError?: boolean
  errorMessage?: string
  errorTooltip?: boolean
  minRows?: number
  maxRows?: number
  variant?: 'bordered' | 'unbordered'
  resize?: 'none' | 'auto' | 'vertical' | 'horizontal'
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
      resize = 'none',
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
      if (resize === 'none') return
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
      <div className='flex h-full w-full flex-col'>
        {labelPlacement === 'outside' && (
          <div className='flex items-center justify-between gap-2'>
            <p className='py-2 text-[12px] font-semibold'>{label}</p>
            {errorTooltip && (
              <Tooltip
                side='bottom'
                align='end'
                content={errorMessage}
                classNames={{
                  trigger: 'h-6 w-6',
                }}
              >
                <ExclamationTriangleIcon
                  className='h-4 w-4'
                  color='var(--danger)'
                />
              </Tooltip>
            )}
          </div>
        )}
        <div className='flex flex-grow items-center gap-2'>
          {labelPlacement === 'outside-left' && (
            <p className='text-xs'>{label}</p>
          )}
          <div className='relative flex h-full w-full'>
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
      </div>
    )
  },
)
Textarea2.displayName = 'Textarea2'

export { Textarea2 }
