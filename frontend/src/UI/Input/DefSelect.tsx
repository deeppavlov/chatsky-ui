import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import * as RadixSelect from "@radix-ui/react-select"
import classNames from "classnames"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

type ItemSelectType = {
  key: string
  value: string
  [key: string]: unknown
}

type DefSelectProps = {
  placeholder?: string
  disabled?: boolean
  className?: string
  items: ItemSelectType[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  mini?: boolean
}

const DefSelect = ({
  disabled = false,
  className,
  items,
  defaultValue,
  onValueChange,
  placeholder,
  mini = false,
}: DefSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue || "")

  useEffect(() => {
    setSelectedValue(defaultValue || "")
  }, [defaultValue])

  const handleChange = (value: string) => {
    setSelectedValue(value)
    if (onValueChange) {
      onValueChange(value)
    }
  }

  return (
    <RadixSelect.Root
      value={selectedValue}
      onValueChange={handleChange}>
      <RadixSelect.Trigger
        disabled={disabled}
        className={classNames(
          "relative flex items-center justify-between min-h-10 h-10 px-3.5 rounded-[8px] shadow-none bg-input-background border border-input-border hover:bg-transparent *:data-[placeholder]:text-input-border",
          className
        )}
        aria-label='Select'>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className='ml-2'>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          sideOffset={8}
          position='popper'
          asChild>
          <motion.div
            className='select-content rounded-[8px] bg-input-background border border-input-border z-[9999]'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.2 },
            }}>
            <RadixSelect.Viewport className='py-1 grid gap-1 w-full'>
              {items.map((item) => (
                <RadixSelect.Item
                  key={item.key}
                  value={item.value}
                  className={classNames(
                    `flex items-center justify-between ${mini ? "px-2 py-0.5" : "p-2"} hover:bg-input-background-disabled data-[highlighted]:bg-input-background-disabled cursor-pointer`,
                    {
                      "bg-input-background-disabled": item.value === selectedValue,
                      "*:text-sm": mini,
                    }
                  )}>
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
  )
}

export default DefSelect
