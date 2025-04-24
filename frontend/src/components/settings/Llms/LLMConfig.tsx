import { createLlmConfig, deleteLlmConfig, updateLlmConfig } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import EditPenIcon from '@/icons/EditPenIcon'
import TrashIcon from '@/icons/TrashIcon'
import ConfirmationModal from '@/modals/ConfirmationModal/ConfirmationModal'
import { ILlmConfig } from '@/types/llmTypes'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { Check } from 'lucide-react'
import React, { useContext, useState } from 'react'

const inputClassNames = {
  inputWrapper: [
    'border-none',
    'data-[focus=true]:after:h-0',
    'shadow-none',
    'h-8',
    '!ps-3',
  ],
  input: ['w-full', 'truncate', 'placeholder:text-input-border'],
}

const LLMConfig = ({ config }: { config: ILlmConfig }) => {
  const initialFormData: ILlmConfig = {
    name: config.name,
    model_name: config.model_name,
    token_name: config.token_name,
    system_prompt: config.system_prompt || '',
  }

  const { tokens, llmConfigs, setLlmConfigs, llmProviders, setEditingConfig } =
    useContext(LlmContext)
  const { openPopUp } = useContext(PopUpContext)
  const [formData, setFormData] = useState<ILlmConfig>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const llms = Object.values(llmProviders).flat()

  const showSaveIcon = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const configIsListed = llmConfigs.some(
    (cfg) => cfg.name === config.name && cfg.name !== '',
  )

  const configNames = llmConfigs.map((cfg) => cfg.name)

  const saveConfig = async (
    field: keyof ILlmConfig,
    value: string,
    blurInput?: () => void,
  ) => {
    const otherFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (key === field) return true
      if (key === 'system_prompt') {
        return true
      }
      return Boolean(value)
    })
    if (!otherFieldsFilled || !value) {
      setError('Please fill in all fields')
      return
    }
    setError(null)

    // если пользователь редактировал имя, но оно осталось прежним
    if (field === 'name' && value === config.name) return

    const configIsExist = field === 'name' && configNames.includes(value)
    if (configIsExist) {
      setError('A configuration with this name already exists')
      return
    }

    if (!configIsListed) {
      await createLlmConfig({ ...formData, [field]: value })
      setLlmConfigs((prev) => [...prev, { ...formData, [field]: value }])
      setFormData(initialFormData)

      blurInput && blurInput()
    } else {
      await updateLlmConfig(config.name, { [field]: value })
      showSaveIcon()
      setLlmConfigs((prev) =>
        prev.map((item) => {
          if (item.name === config?.name) {
            return { ...item, [field]: value }
          }
          return item
        }),
      )
    }
  }

  const debouncedSaveName = useDebouncedCallback(saveConfig, 500)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.replaceAll(' ', '_')
    setFormData((data) => ({
      ...data,
      name,
    }))
    debouncedSaveName('name', name, () => e.target.blur())
  }

  const handleLlmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return
    }

    // если меняем llm на ту, для которой выбранный токен не работает, сбрасываем значение токена
    const token = tokens.find((t) => t.name === formData.token_name)
    const tokenProvider = token?.provider
    const changeToken =
      tokenProvider && llmProviders[tokenProvider].includes(e.target.value)

    setFormData((data) => ({
      ...data,
      model_name: e.target.value,
      token_name: changeToken ? data.token_name : '',
    }))
    saveConfig('model_name', e.target.value)
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return
    }
    setFormData((data) => ({
      ...data,
      token_name: e.target.value,
    }))
    saveConfig('token_name', e.target.value)
  }

  const handleDelete = () => {
    openPopUp(
      <ConfirmationModal
        id='delete-token'
        title={`Do you want to delete ${config.name}?`}
        bodyText='Are you sure you want to delete this configuration?'
        onAction={async () => {
          await deleteLlmConfig(config.name)
          setLlmConfigs((prev) =>
            prev.filter((item) => item.name !== config.name),
          )
        }}
      />,
      'delete-token',
    )
  }

  return (
    <div>
      <div
        className={`grid h-10 w-full grid-cols-4 gap-7 ${configIsListed && 'shadow-[0_1px_0_0_#e5e7eb]'} ${error && 'shadow-[0_1px_0_0_#ff3333]'}`}
      >
        <div className='col-span-1 flex items-center'>
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

        <div className='col-span-1 flex items-center'>
          <Select
            aria-label='Llm'
            labelPlacement='outside'
            placeholder='Select LLM'
            selectedKeys={formData.model_name ? [formData.model_name] : []}
            value={formData.model_name}
            onChange={handleLlmChange}
            radius='sm'
            size='sm'
          >
            {llms.map((item) => (
              <SelectItem key={item}>{item}</SelectItem>
            ))}
          </Select>
        </div>

        <div className='col-span-1 flex items-center gap-2'>
          <div className='flex h-full flex-grow items-center gap-1'>
            <Select
              aria-label='LLM access token'
              labelPlacement='outside'
              placeholder='Select token'
              selectedKeys={formData.token_name ? [formData.token_name] : []}
              value={formData.token_name}
              onChange={handleTokenChange}
              radius='sm'
              size='sm'
            >
              {tokens
                .filter((t) => {
                  return llmProviders[t.provider]?.includes(formData.model_name)
                })
                .map((item) => (
                  <SelectItem key={item.name}>{item.name}</SelectItem>
                ))}
            </Select>
          </div>
        </div>

        <div className='col-span-1 flex items-center gap-2 overflow-hidden'>
          <div className='flex flex-grow items-center gap-1 overflow-hidden'>
            {config.system_prompt ? (
              <span className='flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm'>
                {config.system_prompt}
              </span>
            ) : (
              <span className='flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm text-text-addition'>
                Enter prompt...
              </span>
            )}
            <button
              disabled={!configIsListed}
              onClick={() => setEditingConfig(config)}
              className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
            >
              <EditPenIcon className='group-disabled:stroke-input-border' />
            </button>
          </div>
          {isSaved && <Check className='h-4 flex-shrink-0' />}

          <button
            disabled={!configIsListed}
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

export default LLMConfig
