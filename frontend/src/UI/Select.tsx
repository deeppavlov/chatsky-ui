import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as RadixSelect from '@radix-ui/react-select';
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import cn from 'classnames';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';


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

const Select = ({
  disabled = false,
  className,
  items,
  defaultValue,
  onValueChange,
  placeholder,
  error,
  label,
  textSize = 'text-xs',
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
    <div className='flex w-full flex-col'>
      <div className={'flex items-center justify-between'}>
        <label
          className={cn('text-[12px] font-semibold', label ? 'h-6' : 'h-0')}
          htmlFor={id}
        >
          {label}
        </label>

        {error && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className='flex h-6 w-6 items-center justify-center'>
                <AlertTriangle size='12' color='var(--danger)' />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className='z-[9999] h-6 rounded-lg border border-[#E6E8F0] bg-bg-secondary px-2 py-1 text-xs'
                  side='bottom'
                  sideOffset={0}
                  align='end'
                  alignOffset={0}
                >
                  {error}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <RadixSelect.Root value={selectedValue} onValueChange={handleChange}>
        <RadixSelect.Trigger
          {...props}
          disabled={disabled}
          className={classNames(
            'disabled:hover:input-background-disabled group relative inline-flex h-8 w-full items-center justify-between gap-2 rounded-[8px] bg-btn-accent px-2 text-[12px] *:text-sm hover:bg-select-item-hover focus-visible:bg-select-item-hover focus-visible:outline-none disabled:bg-input-background-disabled data-[state=open]:border-input-border-focus',
            error && 'bg-danger/10',
            className,
          )}
          aria-label='Select'
        >
          <div className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left *:${textSize} *:group-data-[placeholder]:text-input-border`}>
            <RadixSelect.Value placeholder={placeholder}>
              {selectedValue}
            </RadixSelect.Value>
          </div>

          <RadixSelect.Icon className='transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180'>
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
              <RadixSelect.Viewport className='grid w-full gap-1 p-2 '>
                {items.map((item) => (
                  <RadixSelect.Item
                    key={item.key}
                    value={item.value}
                    disabled={item.disabled}
                    className={classNames(
                      'flex cursor-pointer items-center justify-between overflow-hidden truncate whitespace-nowrap rounded-[8px] p-1.5 outline-none *:text-sm data-[highlighted]:bg-select-item-hover',
                      item.disabled && 'cursor-not-allowed opacity-50',
                      textSize,
                    )}
                    data-testid={`selectItem-${item.value.toLowerCase().replace(' ', '-')}`}
                  >
                    <RadixSelect.ItemText asChild>
                      <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
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

export default Select