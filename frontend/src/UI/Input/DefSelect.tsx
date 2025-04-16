import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import * as RadixSelect from '@radix-ui/react-select'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type ItemSelectType = {
  key: string
  value: string
  disabled?: boolean
}

type DefSelectProps = React.HTMLAttributes<HTMLElement> & {
  placeholder?: string
  disabled?: boolean
  className?: string
  items: ItemSelectType[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  mini?: boolean
  isInvalid?: boolean
  errorMessage?: string
}

const DefSelect = ({
  disabled = false,
  className,
  items,
  defaultValue,
  onValueChange,
  placeholder,
  mini = false,
  isInvalid = false,
  errorMessage = '',
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

  return (
    <div className='flex flex-col gap-1'>
      <RadixSelect.Root value={selectedValue} onValueChange={handleChange}>
        <RadixSelect.Trigger
          {...props}
          disabled={disabled}
          className={classNames(
            'relative flex h-10 min-h-10 items-center justify-between rounded-[8px] border border-input-border bg-input-background px-3.5 shadow-none hover:bg-transparent *:data-[placeholder]:text-input-border',
            { 'border-red-500': isInvalid }, // Добавляем класс для ошибки
            className,
          )}
          aria-label='Select'
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon className='ml-2'>
            <ChevronDownIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content sideOffset={8} position='popper' asChild>
            <motion.div
              className='select-content z-[9999] rounded-[8px] border border-input-border bg-input-background'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: { duration: 0.2 },
              }}
            >
              <RadixSelect.Viewport className='grid w-full gap-1 py-1'>
                {items.map((item) => (
                  <RadixSelect.Item
                    key={item.key}
                    value={item.value}
                    disabled={item.disabled}
                    className={classNames(
                      `flex items-center justify-between ${
                        mini ? 'px-2 py-0.5' : 'p-2'
                      } cursor-pointer hover:bg-input-background-disabled data-[highlighted]:bg-input-background-disabled`,
                      {
                        'bg-input-background-disabled':
                          item.value === selectedValue,
                        '*:text-sm': mini,
                        'cursor-not-allowed opacity-50': item.disabled, // Стили для заблокированных элементов
                      },
                    )}
                    data-testid={`selectItem-${item.value.toLowerCase().replace(' ', '-')}`}
                  >
                    <RadixSelect.ItemText>{item.value}</RadixSelect.ItemText>
                    <RadixSelect.ItemIndicator className='absolute right-2'>
                      <CheckIcon />
                    </RadixSelect.ItemIndicator>
                  </RadixSelect.Item>
                ))}
              </RadixSelect.Viewport>
            </motion.div>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {isInvalid && errorMessage && (
        <p className='mt-1 text-sm text-red-500'>{errorMessage}</p>
      )}
    </div>
  )
}

export default DefSelect
