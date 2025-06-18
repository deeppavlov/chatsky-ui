import { Tooltip } from '@/UI/Tooltip'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import cn from 'classnames'
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
            <Tooltip
              side='bottom'
              align='end'
              content={error}
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
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-8 w-full rounded-lg border border-input-border bg-input-background px-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 placeholder:text-text-addition hover:bg-input-background-disabled focus:border-input-border-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-input-background disabled:opacity-50',
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
