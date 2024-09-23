import * as Popover from "@radix-ui/react-popover"
import classNames from "classnames"
import { CheckIcon } from "lucide-react"
import React, { ReactNode, useEffect, useRef, useState } from "react"

interface ComboboxProps {
  items: string[]
  placeholder?: string
  selected: string
  setSelected: (value: string) => void
  startContent?: ReactNode // Дополнительный контент в начале input
  endContent?: ReactNode // Дополнительный контент в конце input
}

const DefCombobox: React.FC<ComboboxProps> = ({
  selected,
  setSelected,
  items,
  placeholder = "Select an option",
  endContent,
  startContent,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState(items)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setFilteredItems(items.filter((item) => item.toLowerCase().includes(value.toLowerCase())))
    setHighlightedIndex(-1) // Сбрасываем выделение
    setIsOpen(true)
  }

  const handleSelectItem = (item: string) => {
    setInputValue(item)
    setSelected(item)
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus() // Ставим фокус обратно на input при открытии
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        console.log(e.key, highlightedIndex)
        if (e.key === "ArrowDown") {
          console.log("arrow down")
          setHighlightedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
          e.preventDefault() // Предотвращаем прокрутку страницы
        } else if (e.key === "ArrowUp") {
          console.log("arrow up")
          setHighlightedIndex((prev) => Math.max(prev - 1, 0))
          e.preventDefault() // Предотвращаем прокрутку страницы
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
          console.log("enter")
          handleSelectItem(filteredItems[highlightedIndex])
          e.preventDefault() // Предотвращаем отправку формы, если она есть
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, highlightedIndex, filteredItems])

  console.log(isOpen)

  return (
    <div className='combobox-container'>
      {/* Input field */}
      {/* <input
        ref={inputRef}
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        // onFocus={() => setIsOpen(true)} // Открываем Popover при фокусе на поле ввода
        placeholder={placeholder}
        className='w-full bg-background p-2 rounded-lg border border-input-border'
      /> */}
      <div
        ref={containerRef}
        className='w-full flex items-center justify-between bg-background p-2 rounded-lg border border-input-border'>
        {startContent && <span style={{ marginRight: "8px" }}>{startContent}</span>}
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          // onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className='w-full bg-transparent outline-none'
        />
        {endContent && <span style={{ marginLeft: "8px" }}>{endContent}</span>}
      </div>

      {/* Popover for dropdown menu */}
      <Popover.Root
        open={isOpen}
        onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <div />
        </Popover.Trigger>

        <Popover.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          align='start'
          side='bottom'
          style={{
            width: containerRef.current?.offsetWidth ?? "320px",
          }}
          className={`mt-2 bg-background border border-input-border rounded-lg py-1 z-[9999] overflow-x-hidden`}>
          {filteredItems.length ? (
            filteredItems.map((item, index) => (
              <div
                key={item}
                className={classNames(
                  "flex items-center justify-between hover:bg-bg-secondary py-1 px-3 cursor-pointer transition-colors",
                  highlightedIndex === index && "bg-bg-secondary"
                )}
                onClick={() => handleSelectItem(item)}>
                {item}
                {selected === item && <CheckIcon className='size-4' />}
              </div>
            ))
          ) : (
            <div className='p-2'>No items found</div>
          )}
        </Popover.Content>
      </Popover.Root>

      {/* Стили для компонента */}
    </div>
  )
}

export default DefCombobox
