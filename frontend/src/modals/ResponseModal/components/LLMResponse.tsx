import { LlmContext } from '@/contexts/llmContext'
import {
  IInputError,
  ILLMResponseHandle,
  responseType,
} from '@/types/ResponseTypes'
import { Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import { Info, Settings } from 'lucide-react'
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePortalContainer } from './usePortalContainer'

interface IProps {
  response: responseType
  setData: React.Dispatch<React.SetStateAction<responseType>>
  responseStor: { [key: string]: responseType }
  nameError: IInputError
  setNameError: React.Dispatch<React.SetStateAction<IInputError>>
}

const LLMResponse = forwardRef<ILLMResponseHandle, IProps>(
  ({ response, setData, responseStor, nameError, setNameError }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setSearchParams] = useSearchParams()
    const { llmConfigs, defaultLlmConfig } = useContext(LlmContext)

    const [llmConfigError, setLlmConfigError] = useState<IInputError>({
      isInvalid: false,
      errorMessage: '',
    })

    const llmConfigId =
      response.data[0].llm?.llm_config_id || defaultLlmConfig?.id || null

    useEffect(() => {
      if (!response.data[0].llm) {
        Object.prototype.hasOwnProperty.call(responseStor, 'llm')
          ? setData(() => ({ ...responseStor['llm'], name: response.name }))
          : setData((prev) => ({
              ...prev,
              type: 'llm',
              data: [
                {
                  priority: 1,
                  llm: {
                    prompt: '',
                    llm_config_id: defaultLlmConfig?.id || '',
                    context_memory_index: 0,
                  },
                },
              ],
            }))
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const validate = () => {
      const { llm_config_id } = response.data[0].llm || {}

      if (!llm_config_id) {
        setLlmConfigError({
          isInvalid: true,
          errorMessage: 'Please fill every field',
        })
        return false
      }

      if (!Object.hasOwn(llmConfigs, llm_config_id)) {
        setLlmConfigError({
          isInvalid: true,
          errorMessage: 'Please select a valid LLM configuration',
        })
        return false
      }
      return true
    }

    useImperativeHandle(ref, () => ({
      validate,
    }))

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value.replaceAll(' ', '_')
      setData({
        ...response,
        name,
      })
      setNameError({ isInvalid: false, errorMessage: '' })
    }

    const changeResponseValue = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
      const key = e.target.name
      const value =
        key === 'context_memory_index'
          ? parseInt(e.target.value.replace(/\D/g, '') || '0')
          : e.target.value

      if (key === 'llm_config_id') {
        setLlmConfigError({ isInvalid: false, errorMessage: '' })
        if (!value) return
      }

      setData((prev) => ({
        ...prev,
        data: [
          {
            ...prev.data[0],
            llm: {
              ...prev.data[0].llm!,
              [key]: value,
            },
          },
        ],
      }))
    }

    const { ref: portalRef, portalContainer } = usePortalContainer()
    return (
      <div
        ref={portalRef}
        className='flex min-h-full w-full flex-col items-center justify-start gap-6'
      >
        <div className='grid w-full grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <Input
              data-testid='llmResponse-name'
              label='Title'
              variant='bordered'
              labelPlacement='outside'
              placeholder='Enter response name'
              value={response.name}
              {...nameError}
              onChange={handleTitleChange}
              classNames={{
                label: 'font-semibold text-xs !translate-y-[-36px]',
                inputWrapper:
                  'min-h-8 h-8 border border-input-border rounded-[8px]',
                base: 'mt-[20px] relative',
                helperWrapper: 'absolute top-8 left-0',
              }}
            />
          </div>
          <div className='col-span-1 flex items-end justify-start gap-2'>
            <Select
              data-testid='llmResponse-config'
              name='llm_config_id'
              popoverProps={{
                portalContainer: portalContainer || undefined,
              }}
              {...llmConfigError}
              label='LLM configuration'
              aria-label='LLM configuration'
              labelPlacement='outside'
              placeholder='Select LLM configuration'
              selectedKeys={
                llmConfigId && Object.hasOwn(llmConfigs, llmConfigId)
                  ? [llmConfigId]
                  : []
              }
              onChange={changeResponseValue}
              classNames={{
                label: 'font-semibold text-xs !translate-y-[-36px]',
                helperWrapper: 'absolute top-8 left-0',
              }}
              radius='sm'
              size='sm'
            >
              {Object.entries(llmConfigs).map(([id, item]) => (
                <SelectItem key={id}>{item.name}</SelectItem>
              ))}
            </Select>
            <button
              onClick={() => setSearchParams({ page: 'settings', tab: 'llms' })}
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-default-100 hover:bg-default-200 active:scale-95'
            >
              <Settings width={18} height={18} />
            </button>
          </div>
        </div>
        <div className='h-0 w-full flex-grow'>
          <Textarea
            name='prompt'
            onChange={changeResponseValue}
            value={response.data[0].llm?.prompt}
            label={
              <>
                <span className='text-xs font-semibold'>Prompt</span>
                <div className='mt-1 flex items-center justify-start gap-2'>
                  <Info color='#009973' width={16} height={16} />
                  <span className='text-xs text-text-secondary'>
                    If you want to display a slot in a response, use the
                    following syntax:{' '}
                    <span className='text-xs text-[#3300FF]'>
                      {'{group_name/slot_name}'}
                    </span>
                  </span>
                </div>
              </>
            }
            labelPlacement='outside'
            variant='bordered'
            height={'100%'}
            radius='sm'
            classNames={{
              base: 'h-full',
              innerWrapper: 'flex-grow flex-col',
              inputWrapper:
                'ps-[14px] pe-1 py-[10px] flex-grow bg-background border-1 border-input-border w-full',
              input: 'pe-[6px]',
            }}
            data-testid='llmResponse-prompt'
          />
        </div>
        <div className='w-full'>
          <div className='flex w-full flex-col gap-1'>
            <span className='text-xs font-semibold'>Context memory index</span>
            <div className='flex w-full items-center gap-1'>
              <label className='inline-flex h-10 min-h-10 w-[55px] min-w-[55px] cursor-text items-center gap-3 rounded-[8px] border border-input-border px-3 shadow-sm transition-colors !duration-150 tap-highlight-transparent transition-background focus-within:border-black'>
                <input
                  name='context_memory_index'
                  className='h-full w-full bg-transparent text-small font-normal !outline-none placeholder:text-foreground-500 focus-visible:outline-none'
                  type='text'
                  aria-describedby='context_memory_index_help'
                  value={response.data[0].llm?.context_memory_index}
                  onChange={changeResponseValue}
                />
              </label>
              <div
                id='context_memory_index_help'
                className='flex items-start gap-1 px-1'
              >
                <Info
                  color='#009973'
                  width={16}
                  height={16}
                  className='flex-shrink-0'
                />
                <span className='text-tiny leading-[1.5] text-foreground-400'>
                  Context memory index is an integer that represents the number
                  of messages that this LLM node will remember for context. If
                  you need the LLM to remember the entire dialog context, enter
                  -1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default LLMResponse
