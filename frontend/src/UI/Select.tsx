import { Tooltip } from '@/UI/Tooltip'
import {
  CheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'
import * as RadixSelect from '@radix-ui/react-select'
import cn from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useId, useState } from 'react'

type ItemSelectType = {
  key: string
  value: string
  disabled?: boolean
}

interface DefSelectProps extends React.HTMLAttributes<HTMLElement> {
  placeholder?: string
  disabled?: boolean
  className?: string
  items: ItemSelectType[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  error?: string
  label?: string
  textSize?: string
}

export const Select = ({
  disabled = false,
  className,
  items,
  defaultValue,
  onValueChange,
  placeholder,
  error,
  label,
  textSize = 'text-sm',
  ...props
}: DefSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || '')

  useEffect(() => {
    setSelectedValue(defaultValue || '')
  }, [defaultValue])

  const handleChange = (value: string) => {
    setSelectedValue(value)
    if (onValueChange) {
      onValueChange(value)
    }
  }

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
      <RadixSelect.Root value={selectedValue} onValueChange={handleChange}>
        <RadixSelect.Trigger
          {...props}
          disabled={disabled}
          className={cn(
            'disabled:hover:input-background-disabled group inline-flex h-8 items-center justify-between gap-2 rounded-[8px] bg-btn-accent px-2 *:overflow-hidden *:text-ellipsis *:whitespace-nowrap hover:bg-select-item-hover focus-visible:bg-select-item-hover focus-visible:outline-none disabled:bg-input-background-disabled *:data-[placeholder]:text-input-border',
            error && 'bg-danger/10',
            className,
            textSize,
          )}
          aria-label='Select'
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className='flex-shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180'>
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content sideOffset={8} position='popper' asChild>
            <motion.div
              className='select-content hover::outline-none z-[9999] rounded-xl bg-input-background text-lg shadow-medium focus-visible:outline-none'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.2 },
              }}
            >
              <RadixSelect.Viewport className='w-ful grid gap-1 p-2'>
                {items.map((item) => (
                  <RadixSelect.Item
                    key={item.key}
                    value={item.value}
                    disabled={item.disabled}
                    className={cn(
                      'flex cursor-pointer items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-[8px] p-1.5 outline-none data-[highlighted]:bg-select-item-hover',
                      item.disabled && 'cursor-not-allowed opacity-50',
                    )}
                    data-testid={`selectItem-${item.value.toLowerCase().replace(' ', '-')}`}
                  >
                    <RadixSelect.ItemText asChild>
                      <div
                        className={cn(
                          'overflow-hidden text-ellipsis whitespace-nowrap',
                          textSize,
                        )}
                      >
                        {item.value}
                      </div>
                    </RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className=''>
                      <CheckIcon />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Viewport>
            </motion.div>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
