import { createLlmConfig, deleteLlmConfig, updateLlmConfig } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import EditPenIcon from '@/icons/EditPenIcon'
import TrashIcon from '@/icons/TrashIcon'
import ConfirmationModal from '@/modals/ConfirmationModal/ConfirmationModal'
import { ILlmConfig } from '@/types/llmTypes'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { isEqual } from 'lodash'
import { Check, X } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'

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

interface ILlmConfigWithId extends ILlmConfig {
  id: string
}

const LLMConfig = ({ config }: { config: ILlmConfigWithId }) => {
  const initialFormData: ILlmConfig = {
    name: config.name,
    model_name: config.model_name,
    token_id: config.token_id,
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

  const configIsListed = Object.hasOwn(llmConfigs, config.id)

  const configNames = Object.values(llmConfigs).map((cfg) => cfg.name)

  const validateFields = (currentField: keyof ILlmConfig, value: string) => {
    const otherFieldsFilled = Object.entries(formData).every(([key, value]) => {
      if (key === currentField) return true
      if (key === 'system_prompt') {
        return true
      }
      return Boolean(value)
    })
    if (!otherFieldsFilled || !value) {
      setError('Please fill in all fields')
      return false
    }
    setError(null)

    // если пользователь редактировал имя, но оно осталось прежним
    if (currentField === 'name' && value === config.name) return

    const configIsExist =
      currentField === 'name'
        ? configNames.includes(value)
        : !configIsListed && configNames.includes(formData.name)
    if (configIsExist) {
      setError('A configuration with this name already exists')
      return false
    }

    const selectedToken =
      currentField === 'token_id' ? tokens[value] : tokens[formData.token_id]
    const selectedTokenProvider = selectedToken?.provider
    const tokenMismatch =
      selectedTokenProvider &&
      !llmProviders[selectedTokenProvider].includes(
        currentField === 'model_name' ? value : formData.model_name,
      )

    if (tokenMismatch) {
      setError('Token does not match the selected LLM')
      return false
    }

    return true
  }

  const saveConfig = async (
    field: keyof ILlmConfig,
    value: string,
    blurInput?: () => void,
  ) => {
    if (!validateFields(field, value)) {
      return
    }

    if (!configIsListed) {
      const configId = await createLlmConfig({ ...formData, [field]: value })

      setLlmConfigs((prev) => ({
        ...prev,
        [configId]: { ...formData, [field]: value },
      }))
      setFormData(initialFormData)
      blurInput && blurInput()
    } else {
      await updateLlmConfig(config.id, { [field]: value })
      showSaveIcon()

      setLlmConfigs((prev) => ({
        ...prev,
        [config.id]: { ...prev[config.id], [field]: value },
      }))
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
    setFormData((data) => ({
      ...data,
      model_name: e.target.value,
    }))
    saveConfig('model_name', e.target.value)
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return
    }
    setFormData((data) => ({
      ...data,
      token_id: e.target.value,
    }))
    saveConfig('token_id', e.target.value)
  }

  const handleDelete = () => {
    openPopUp(
      <ConfirmationModal
        id='delete-token'
        title={`Do you want to delete ${config.name}?`}
        bodyText='Are you sure you want to delete this configuration?'
        onAction={async () => {
          await deleteLlmConfig(config.id)
          setLlmConfigs((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [config.id]: _, ...rest } = prev
            return rest
          })
        }}
      />,
      'delete-token',
    )
  }

  useEffect(() => {
    const usedToken = tokens[formData.token_id]
    const provider = usedToken?.provider
    setError(null)
    if (!usedToken) {
      if (!configIsListed) {
        return
      }
      setError('The selected token was deleted. Please choose another token.')
    } else if (
      formData.model_name &&
      !llmProviders[provider]?.includes(formData.model_name)
    ) {
      setError('Token does not match the selected LLM')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  return (
    <div data-testid={`llm-config-${config.id}`}>
      <div
        className={`grid h-10 w-full grid-cols-4 gap-7 ${configIsListed && 'shadow-[0_1px_0_0_#e5e7eb]'} ${error && 'shadow-[0_1px_0_0_#ff3333]'}`}
      >
        <div className='col-span-1 flex items-center'>
          <Input
            data-testid='llmConfig_name-input'
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
            data-testid='llmConfig_model-select'
            aria-label='Llm'
            labelPlacement='outside'
            placeholder='Select LLM'
            selectedKeys={formData.model_name ? [formData.model_name] : []}
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
              data-testid='llmConfig_token-select'
              aria-label='LLM access token'
              labelPlacement='outside'
              placeholder='Select token'
              selectedKeys={
                Object.hasOwn(tokens, formData.token_id)
                  ? [formData.token_id]
                  : []
              }
              onChange={handleTokenChange}
              radius='sm'
              size='sm'
              disabledKeys={
                formData.model_name
                  ? [
                      ...Object.keys(tokens).filter(
                        (key) =>
                          !llmProviders[tokens[key].provider]?.includes(
                            formData.model_name,
                          ),
                      ),
                    ]
                  : []
              }
            >
              {Object.entries(tokens).map(([id, item]) => (
                <SelectItem key={String(id)}>{item.name}</SelectItem>
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
              data-testid='llmConfig_prompt-edit-button'
              disabled={!configIsListed}
              onClick={() => setEditingConfig(config)}
              className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
            >
              <EditPenIcon className='group-disabled:stroke-input-border' />
            </button>
          </div>
          {isSaved && <Check className='h-4 flex-shrink-0' />}

          {configIsListed ? (
            <button
              data-testid='llmConfig_delete-button'
              onClick={handleDelete}
              className='group flex h-8 w-8 flex-shrink-0 items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100'
            >
              <TrashIcon className='group-disabled:stroke-input-border' />
            </button>
          ) : (
            <button
              data-testid='llmConfig_reset-button'
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

export default LLMConfig
