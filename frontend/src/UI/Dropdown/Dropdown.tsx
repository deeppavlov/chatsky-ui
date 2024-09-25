import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import classNames from "classnames"
import React, { forwardRef } from "react"

export type DropdownItemType = {
  label: string
  value: string
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
  shortcut?: string
  onClick?: () => void
}

export type DropdownGroupType = {
  title?: string
  items: DropdownItemType[]
}

interface DropdownProps {
  groups: DropdownGroupType[]
  onSelect: (value: string) => void
  triggerContent: React.ReactNode
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ groups, onSelect, triggerContent }, ref) => {
    // const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
    // const [currentGroupIndex, setCurrentGroupIndex] = useState<number | null>(null)

    // const handleKeyDown = (event: React.KeyboardEvent) => {
    //   const allItems = groups.flatMap((group) => group.items)

    //   if (event.key === "ArrowDown") {
    //     if (highlightedIndex === null || currentGroupIndex === null) {
    //       setHighlightedIndex(0)
    //       setCurrentGroupIndex(0)
    //     } else {
    //       setHighlightedIndex((prev) =>
    //         prev === null ? 0 : Math.min(prev + 1, allItems.length - 1)
    //       )
    //     }
    //   } else if (event.key === "ArrowUp") {
    //     setHighlightedIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)))
    //   } else if (event.key === "Enter" && highlightedIndex !== null && currentGroupIndex !== null) {
    //     const selectedItem = allItems[highlightedIndex]
    //     if (!selectedItem.disabled) {
    //       onSelect(selectedItem.value)
    //       selectedItem.onClick?.()
    //     }
    //   }
    // }

    return (
      <DropdownMenu.Root>
        {/* Триггер для Dropdown */}
        <DropdownMenu.Trigger
          autoFocus={false}
          asChild>
          <div
            autoFocus={false}
            className='focus:outline-1 outline-border rounded-lg group'
            tabIndex={0}>
            {triggerContent}
          </div>
        </DropdownMenu.Trigger>

        {/* Контент Dropdown */}
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault()
            }}
            asChild
            key={"dropdown-content"}
            sideOffset={5}
            align='start'
            side='bottom'
            className='z-[99] min-w-56 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out data-[state=open]:zoom-in'>
            <div
              className={classNames(
                "bg-background border border-border rounded-xl p-2 origin-top-left"
              )}>
              {groups.map((group, groupIndex) => (
                <DropdownMenu.Group
                  title={group.title}
                  key={`group-${groupIndex}`}
                  className='grid gap-1'>
                  {group.items.map((item, index) => (
                    <DropdownMenu.Item
                      key={item.value}
                      onSelect={() => {
                        if (!item.disabled) {
                          onSelect(item.value)
                          item.onClick?.()
                        }
                      }}
                      disabled={item.disabled}
                      className={classNames(
                        `flex items-center justify-between px-3 py-2 rounded-lg outline-none transition-colors !duration-150 data-[highlighted]:bg-bg-secondary border border-transparent data-[highlighted]:border-border ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} `,
                        item.className
                      )}>
                      {/* Иконка */}
                      <div className='flex items-center'>
                        {item.icon && <span className='mr-2'>{item.icon}</span>}
                        <span>{item.label}</span>
                      </div>
                      {/* Шорткат */}
                      {item.shortcut && (
                        <span className='ml-auto text-gray-400'>{item.shortcut}</span>
                      )}
                    </DropdownMenu.Item>
                  ))}

                  {/* Разделитель между группами */}
                  {groupIndex < groups.length - 1 && (
                    <DropdownMenu.Separator className='my-2 h-px bg-input-border' />
                  )}
                </DropdownMenu.Group>
              ))}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
)

export default Dropdown
