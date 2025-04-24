import { createLLMToken, deleteLLMToken, updateLLMToken } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import TrashIcon from '@/icons/TrashIcon'
import ConfirmationModal from '@/modals/ConfirmationModal/ConfirmationModal'
import { IToken, ITokenFormData } from '@/types/llmTypes'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { Check, Eye, EyeOff } from 'lucide-react'
import React, { useContext, useState } from 'react'

const inputClassNames = {
  inputWrapper: [
    'border-none',
    'data-[focus=true]:after:h-0',
    'shadow-none',
    'h-8',
    '!ps-0',
  ],
  input: ['w-full', 'truncate', 'placeholder:text-input-border'],
}

const LLMToken = ({ token }: { token: IToken }) => {
  const initialFormData: ITokenFormData = {
    name: token.name,
    provider: token.provider,
    value: token?.value || '',
  }
  const { llmProviders, setTokens, tokens } = useContext(LlmContext)
  const { openPopUp } = useContext(PopUpContext)
  const [hidePassword, setHidePassword] = useState(true)
  const [formData, setFormData] = useState<ITokenFormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const tokenIsListed = tokens.some(
    (t) => t.name === token.name && t.name !== '',
  )
  const tokenNames = tokens.map((t) => t.name)

  const showSaveIcon = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const saveToken = async (
    field: keyof IToken,
    input: HTMLInputElement | HTMLSelectElement,
  ) => {
    const otherFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (key === field) return true
      if (key === 'value') {
        return tokenIsListed ? true : Boolean(value)
      }
      return Boolean(value)
    })
    if (!otherFieldsFilled || !input.value) {
      console.log('all fields')

      setError('Please fill in all fields')
      return
    }
    setError(null)

    if (tokenNames.includes(formData.name) && formData.name !== token.name) {
      setError('A token with this name already exists')
      return
    }

    if (!tokenIsListed) {
      await createLLMToken({ ...formData, [field]: input.value })
      setTokens((prev) => [...prev, { ...formData, [field]: input.value }])
      setFormData(initialFormData)
      ;['value', 'name'].includes(field) && input.blur()
    } else {
      await updateLLMToken(token, { [field]: input.value })
      showSaveIcon()
      setTokens((prev) =>
        prev.map((item) => {
          if (item.name === token?.name) {
            return { ...item, [field]: input.value }
          }
          return item
        }),
      )
    }
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return
    }
    setFormData((data) => ({
      ...data,
      provider: e.target.value,
    }))
    saveToken('provider', e.target)
  }

  const debouncedUpdateToken = useDebouncedCallback(saveToken, 500)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setFormData((data) => ({
      ...data,
      name: e.target.value,
    }))
    debouncedUpdateToken('name', e.target)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setFormData((data) => ({
      ...data,
      value: e.target.value,
    }))
    debouncedUpdateToken('value', e.target)
  }

  const handleDelete = () => {
    openPopUp(
      <ConfirmationModal
        id='delete-token'
        title={`Do you want to delete ${token.name}?`}
        bodyText='' // уточнить текст модалки
        onAction={async () => {
          await deleteLLMToken(formData)
          setTokens((prev) =>
            prev.filter((item) => item.name !== formData.name),
          )
        }}
      />,
      'delete-token',
    )
  }

  return (
    <div>
      <div
        className={`grid h-10 w-full grid-cols-7 gap-7 ${tokenIsListed && 'shadow-[0_1px_0_0_#e5e7eb]'} ${error && 'shadow-[0_1px_0_0_#ff3333]'}`}
      >
        <div className='col-span-2 flex items-center'>
          <Select
            aria-label='Llm service'
            labelPlacement='outside'
            placeholder='Select LLM service'
            selectedKeys={formData.provider ? [formData.provider] : []}
            value={formData.provider}
            onChange={handleServiceChange}
            radius='sm'
            size='sm'
          >
            {Object.keys(llmProviders).map((item) => (
              <SelectItem key={item}>{item}</SelectItem>
            ))}
          </Select>
        </div>

        <div className='col-span-2 flex items-center'>
          <Input
            placeholder='Enter name...'
            value={formData.name}
            onChange={handleNameChange}
            disableAnimation
            size='sm'
            variant='underlined'
            classNames={inputClassNames}
          />
        </div>

        <div className='col-span-3 flex items-center gap-2 overflow-hidden'>
          {tokenIsListed && typeof token?.value !== 'string' ? (
            <span className='flex-grow'>••••••••••</span>
          ) : (
            <div className='flex h-full flex-grow items-center gap-1'>
              <Input
                type={hidePassword ? 'password' : 'text'}
                placeholder='Enter value...'
                value={formData.value}
                onChange={handleValueChange}
                disableAnimation
                size='sm'
                variant='underlined'
                classNames={inputClassNames}
              />
              <button
                className='h-6 w-6 flex-shrink-0 hover:scale-105 active:scale-95'
                onClick={() => setHidePassword((prev) => !prev)}
              >
                {hidePassword ? (
                  <Eye className='stroke-input-border' size={21} />
                ) : (
                  <EyeOff className='stroke-input-border' size={21} />
                )}
              </button>
            </div>
          )}
          {isSaved && <Check className='h-4 flex-shrink-0' />}

          <button
            // disabled={!tokenIsListed}
            onClick={handleDelete}
            className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
          >
            <TrashIcon className='group-disabled:stroke-input-border' />
          </button>
        </div>
      </div>
      {error && (
        <div className='mb-1 flex h-7 items-center text-sm text-danger'>
          {error}
        </div>
      )}
    </div>
  )
}

export default LLMToken
