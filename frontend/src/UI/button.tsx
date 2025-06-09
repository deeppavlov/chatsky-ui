import { Slot } from '@radix-ui/react-slot'
import { Spinner } from '@radix-ui/themes'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from 'classnames'
import * as React from 'react'

const defaultClassName =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap \
text-sm font-normal ring-offset-white \
transition-colors transition-transform \
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground-800 focus-visible:ring-offset-2 \
disabled:pointer-events-none disabled:opacity-50 \
[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 \
dark:ring-offset-foreground-800 dark:focus-visible:ring-foreground-300 \
active:scale-[0.97] \
relative overflow-hidden text-foreground'

const buttonVariants = cva(defaultClassName, {
  variants: {
    variant: {
      default:
        'bg-foreground text-foreground-50 hover:bg-foreground-800/80 text-color-foreground',
      primary: 'hover:bg-foreground-200/80',
      // secondary:
      //   'bg-foreground-100 text-foreground-900 hover:bg-foreground-500 dark:bg-foreground-800 dark:text-foreground-50 \
      //   dark:hover:bg-foreground-600 text-sm font-normal',
      // destructive:
      //   'bg-red-500 text-ёё-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90',
      // outline:
      //   'border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',

      // ghost:
      //   'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
      // link: 'text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50',
    },

    size: {
      default: 'h-10 px-4',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10 p-0 flex items-center justify-center [&_svg]:size-6 bg-foreground-300/90 hover:bg-foreground-200/90 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isIconOnly?: boolean
  isDisabled?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      isIconOnly = false,
      isDisabled = false,
      ...props
    },
    ref,
  ) => {
    const sttleIsLoading = isLoading ? 'opacity-50' : 'opacity-100'
    const buttonSize = isIconOnly ? 'icon' : size

    const Comp = asChild ? Slot : 'button'
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2',
          sttleIsLoading,
          isDisabled && 'pointer-events-none opacity-50',
        )}
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size: buttonSize, className }),
          )}
          ref={ref}
          {...props}
        >
          {isLoading && <Spinner size='3' />}
          {props.children}
        </Comp>
      </div>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
