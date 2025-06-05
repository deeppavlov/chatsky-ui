import * as Tooltip from '@radix-ui/react-tooltip'
import cn from 'classnames'
import { AlertTriangle } from 'lucide-react'
import { ComponentProps, forwardRef, useId } from 'react'

interface IProps extends ComponentProps<'input'> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, IProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const id = useId()
    return (
      <div className='flex w-full flex-col gap-1'>
        <div className={'flex items-center justify-between'}>
          <label
            className={cn('text-[12px] font-semibold', label ? 'h-6' : 'h-0')}
            htmlFor={id}
          >
            {label}
          </label>

          {error && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger className='flex h-6 w-6 items-center justify-center'>
                  <AlertTriangle size='12' color='var(--danger)' />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className='z-[9999] h-6 rounded-lg border border-[#E6E8F0] bg-bg-secondary px-2 py-1 text-xs'
                    side='bottom'
                    sideOffset={0}
                    align='end'
                    alignOffset={0}
                  >
                    {error}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-8 w-full rounded-lg border border-input-border bg-input-background px-3 py-1.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 placeholder:text-text-addition hover:bg-input-background-disabled focus:border-input-border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-input-background disabled:opacity-50',
            error &&
              'border-input-border-error focus:border-input-border-error',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
