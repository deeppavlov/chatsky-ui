import { LlmContext } from '@/contexts/llmContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { usePortalContainer } from '@/modals/ResponseModal/components/usePortalContainer'
import { ILLMConditionHandle } from '@/types/ConditionTypes'
import { IInputError } from '@/types/ResponseTypes'
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
import { ConditionModalContentType } from '../ConditionModal'

const UsingLLMConditionSection = forwardRef<
  ILLMConditionHandle,
  ConditionModalContentType & {
    nameError: IInputError
    setNameError: React.Dispatch<React.SetStateAction<IInputError>>
  }
>(({ condition, setData, nameError, setNameError }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams()
  const { closePopUp } = useContext(PopUpContext)
  const { llmConfigs, defaultLlmConfig } = useContext(LlmContext)

  const [llmConfigError, setLlmConfigError] = useState<IInputError>({
    isInvalid: false,
    errorMessage: '',
  })

  const llmConfigId =
    condition.data.llm?.llm_config_id || defaultLlmConfig?.id || null

  useEffect(() => {
    if (!condition.data.llm) {
      setData({
        ...condition,
        type: 'llm',
        data: {
          ...condition.data,
          llm: {
            prompt: '',
            llm_config_id: defaultLlmConfig?.id || '',
          },
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = () => {
    const { llm_config_id } = condition.data.llm || {}

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

  useImperativeHandle(ref, () => ({ validate }))

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.replaceAll(' ', '_')
    setData({
      ...condition,
      name,
    })
    setNameError({ isInvalid: false, errorMessage: '' })
  }

  const changeConditionValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const key = e.target.name
    const value = e.target.value
    if (key === 'llm_config_id') {
      setLlmConfigError({ isInvalid: false, errorMessage: '' })
      if (!value) return
    }
    setData({
      ...condition,
      type: 'llm',
      data: {
        ...condition.data,
        llm: {
          ...condition.data.llm!,
          [key]: value,
        },
      },
    })
  }

  const { ref: portalRef, portalContainer } = usePortalContainer()
  return (
    <div ref={portalRef} className='h-0 flex-grow'>
      <div className='flex min-h-full w-full flex-col items-center justify-start gap-6'>
        <div className='grid w-full grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <Input
              label='Title'
              variant='bordered'
              labelPlacement='outside'
              placeholder="Enter response's name here"
              value={condition.name}
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
              popoverProps={{
                portalContainer: portalContainer || undefined,
              }}
              label='LLM configuration'
              name='llm_config_id'
              aria-label='LLM configuration'
              labelPlacement='outside'
              placeholder='Select LLM configuration'
              selectedKeys={
                llmConfigId && Object.hasOwn(llmConfigs, llmConfigId)
                  ? [llmConfigId]
                  : []
              }
              onChange={changeConditionValue}
              classNames={{
                label: 'font-semibold text-xs !translate-y-[-36px]',
                helperWrapper: 'absolute top-8 left-0',
              }}
              {...llmConfigError}
              radius='sm'
              size='sm'
            >
              {Object.entries(llmConfigs).map(([id, item]) => (
                <SelectItem key={id}>{item.config_name}</SelectItem>
              ))}
            </Select>
            <button
              onClick={() => {
                closePopUp('condition-modal')
                setSearchParams({ page: 'settings', tab: 'llms' })
              }}
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-default-100 hover:bg-default-200 active:scale-95'
            >
              <Settings width={18} height={18} />
            </button>
          </div>
        </div>
        <div className='h-0 w-full flex-grow'>
          <Textarea
            name='prompt'
            onChange={changeConditionValue}
            // value={response.data[0].llm?.prompt}
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
          />
        </div>
      </div>
    </div>
    // <div className='mt-2 flex w-full flex-col items-start justify-start gap-4'>
    //   <div className='grid w-full grid-cols-2 gap-4'>
    //     <Select
    //       label='Model name'
    //       name='model_name'
    //       onChange={changeConditionValue}
    //       value={condition.data.llm?.model_name}
    //       placeholder='Select a model'
    //       labelPlacement='outside'
    //     >
    //       {modelNames.map((modelName) => (
    //         <SelectItem key={modelName} value={modelName}>
    //           {modelName}
    //         </SelectItem>
    //       ))}
    //     </Select>
    //     <Input
    //       label='API Key'
    //       placeholder='Enter your API key'
    //       labelPlacement='outside'
    //       name='api_key'
    //       onChange={changeConditionValue}
    //       value={condition.data.llm?.api_key}
    //     />
    //   </div>
    //   <Textarea
    //     label='Prompt'
    //     labelPlacement='outside'
    //     placeholder='Enter your prompt'
    //     classNames={{
    //       input: 'h-max',
    //     }}
    //     name='prompt'
    //     onChange={changeConditionValue}
    //     value={condition.data.llm?.prompt}
    //   />
    //   <Textarea
    //     label='Condition satisfaction triggers'
    //     labelPlacement='outside'
    //     placeholder='# if the following is true, the condition is satisfied'
    //     classNames={{
    //       input: 'h-max',
    //     }}
    //   />
    // </div>
  )
})

export default UsingLLMConditionSection
