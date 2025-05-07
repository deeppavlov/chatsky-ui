import { createLLMToken, deleteLLMToken, updateLLMToken } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import TrashIcon from '@/icons/TrashIcon'
import ConfirmationModal from '@/modals/ConfirmationModal/ConfirmationModal'
import { IToken, ITokenFormData } from '@/types/llmTypes'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { isEqual } from 'lodash'
import { Check, Eye, EyeOff, X } from 'lucide-react'
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

interface ITokenWithId extends IToken {
  id: string
}

const LLMToken = ({ token }: { token: ITokenWithId }) => {
  const initialFormData: ITokenFormData = {
    name: token.name,
    provider: token.provider,
    value: token?.value || '',
  }
  const { llmProviders, setTokens, tokens, llmConfigs } = useContext(LlmContext)
  const { openPopUp } = useContext(PopUpContext)
  const [hidePassword, setHidePassword] = useState(true)
  const [formData, setFormData] = useState<ITokenFormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const tokenIsListed = Object.hasOwn(tokens, token.id)
  const tokenNames = Object.values(tokens).map((t) => t.name)

  const showSaveIcon = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const validateFields = (currentField: keyof IToken, value: string) => {
    const otherFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (key === currentField) return true
      if (key === 'value') {
        return tokenIsListed ? true : Boolean(value)
      }
      return Boolean(value)
    })

    if (!otherFieldsFilled || !value) {
      setError('Please fill in all fields')
      return
    }
    setError(null)

    if (currentField === 'name') {
      // если пользователь редактировал имя, но оно осталось прежним
      if (value === token.name) return

      if (/^_|_$/.test(value)) {
        // стоит ли запрещать?
        setError('Name cannot start or end with an underscore')
        return
      }
    }

    const tokenIsExist =
      currentField === 'name'
        ? tokenNames.includes(value)
        : !tokenIsListed && tokenNames.includes(formData.name)
    if (tokenIsExist) {
      setError('A token with this name already exists')
      return
    }
    return true
  }

  const saveToken = async (
    field: keyof IToken,
    value: string,
    blurInput?: () => void,
  ) => {
    if (!validateFields(field, value)) {
      return
    }

    if (!tokenIsListed) {
      const tokenId = await createLLMToken({ ...formData, [field]: value })
      setTokens((prev) => ({
        ...prev,
        [tokenId]: { ...formData, [field]: value },
      }))
      setFormData(initialFormData)
      blurInput?.()
    } else {
      await updateLLMToken(token.id, { [field]: value })
      showSaveIcon()
      setTokens((prev) => ({
        ...prev,
        [token.id]: { ...prev[token.id], [field]: value },
      }))
    }
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return
    }
    const provider = e.target.value
    setFormData((data) => ({
      ...data,
      provider,
    }))
    saveToken('provider', provider)
  }

  const debouncedUpdateToken = useDebouncedCallback(saveToken, 500)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const name = e.target.value.replaceAll(' ', '_')
    setFormData((data) => ({
      ...data,
      name,
    }))
    debouncedUpdateToken('name', name, () => e.target.blur())
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const value = e.target.value
    setFormData((data) => ({
      ...data,
      value,
    }))
    debouncedUpdateToken('value', value, () => e.target.blur())
  }

  const handleDelete = () => {
    const relatedConfigNames = Object.values(llmConfigs)
      .filter((config) => config.token_id === token.id)
      .map((cfg) => cfg.config_name)

    const bodyText = relatedConfigNames.length ? (
      <span className='text-sm leading-relaxed text-text-secondary'>
        This token is used in the following configurations:
        <b> {relatedConfigNames.join(', ')}</b>. Are you sure you want to delete
        it?
      </span>
    ) : (
      <span className='text-sm leading-relaxed text-text-secondary'>
        Are you sure you want to delete this token?
      </span>
    )

    openPopUp(
      <ConfirmationModal
        id='delete-token'
        title={`Do you want to delete ${token.name}?`}
        bodyText={bodyText}
        onAction={async () => {
          await deleteLLMToken(token.id)
          setTokens((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [token.id]: _, ...rest } = prev
            return rest
          })
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

          {tokenIsListed ? (
            <button
              onClick={handleDelete}
              className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
            >
              <TrashIcon className='group-disabled:stroke-input-border' />
            </button>
          ) : (
            <button
              onClick={() => {
                setFormData(initialFormData)
                setError(null)
              }}
              disabled={isEqual(formData, initialFormData)}
              className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
            >
              <X
                className='stroke-foreground group-disabled:stroke-input-border'
                size={21}
              />
            </button>
          )}
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
