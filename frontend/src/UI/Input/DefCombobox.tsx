import * as Popover from '@radix-ui/react-popover'
import classNames from 'classnames'
import { CheckIcon } from 'lucide-react'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

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
  placeholder = 'Select an option',
  endContent,
  startContent,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredItems, setFilteredItems] = useState(items)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setFilteredItems(
      items.filter((item) => item.toLowerCase().includes(value.toLowerCase())),
    )
    setHighlightedIndex(-1) // Сбрасываем выделение
    setIsOpen(true)
  }

  const handleSelectItem = useCallback(
    (item: string) => {
      setInputValue(item)
      setSelected(item)
      setIsOpen(false)
    },
    [setSelected],
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus() // Ставим фокус обратно на input при открытии
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredItems.length - 1),
          )
          e.preventDefault() // Предотвращаем прокрутку страницы
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex((prev) => Math.max(prev - 1, 0))
          e.preventDefault() // Предотвращаем прокрутку страницы
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          handleSelectItem(filteredItems[highlightedIndex])
          e.preventDefault() // Предотвращаем отправку формы, если она есть
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, highlightedIndex, filteredItems, handleSelectItem])

  return (
    <div className='combobox-container'>
      <div
        ref={containerRef}
        className='flex w-full items-center justify-between rounded-lg border border-input-border bg-background p-2 transition-colors hover:bg-bg-secondary'
      >
        {startContent && (
          <span style={{ marginRight: '8px' }}>{startContent}</span>
        )}
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className='w-full bg-transparent text-sm outline-none placeholder:text-input-border'
        />
        {endContent && <span style={{ marginLeft: '8px' }}>{endContent}</span>}
      </div>

      {/* Popover for dropdown menu */}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <div />
        </Popover.Trigger>

        <Popover.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          align='start'
          side='bottom'
          style={{
            width: containerRef.current?.offsetWidth ?? '320px',
          }}
          className={`z-[9999] mt-2 overflow-x-hidden rounded-lg border border-input-border bg-background py-1 *:text-sm`}
        >
          {filteredItems.length ? (
            filteredItems.map((item, index) => (
              <div
                key={item}
                className={classNames(
                  'flex cursor-pointer items-center justify-between px-3 py-1 transition-colors hover:bg-bg-secondary',
                  highlightedIndex === index && 'bg-bg-secondary',
                )}
                onClick={() => handleSelectItem(item)}
              >
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
