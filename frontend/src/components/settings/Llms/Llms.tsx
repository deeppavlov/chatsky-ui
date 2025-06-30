import { setDefaultConfigId } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { Divider, Select, SelectItem } from '@nextui-org/react'
import React, { useContext } from 'react'
import LLMConfig from './LLMConfig'
import LLMToken from './LLMToken'
import PromptRedactor from './PromptRedactor'

const Llms = () => {
  const { tokens, llmConfigs, defaultLlmConfig, setDefaultLlmConfig } =
    useContext(LlmContext)

  const handleDefaultConfigChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (!e.target.value) return
    const id = e.target.value
    await setDefaultConfigId(id)
    setDefaultLlmConfig({ ...llmConfigs[id], id })
  }

  return (
    <div className='flex h-full w-full items-start justify-start gap-9'>
      <ScrolledContainer
        scrollbarOffset='-30px'
        scrollbarPadding='18px'
        className='basis-7/12'
      >
        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>LLM access tokens</h3>
          <p className='mb-6 text-sm text-text-addition'>
            Enter credentials for LLM services you will use in this project.
          </p>
          <div className='grid h-10 w-full grid-cols-7 gap-7 border-b-1'>
            <div className='col-span-2 flex items-center ps-3 text-sm font-semibold text-text-secondary'>
              Service
            </div>
            <div className='col-span-2 flex items-center text-sm font-semibold text-text-secondary'>
              Access token name
            </div>
            <div className='col-span-3 flex items-center text-sm font-semibold text-text-secondary'>
              Access token
            </div>
          </div>

          {Object.entries(tokens).map(([id, t]) => (
            <LLMToken key={id} token={{ ...t, id }} />
          ))}
          <LLMToken
            token={{
              id: '',
              name: '',
              value: '',
              provider: '',
            }}
          />
        </section>

        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>
            Your LLM configurations
          </h3>
          <p className='mb-6 text-sm text-text-addition'>
            Arrange LLMs and your access tokens to use them for conditions,
            responses and slot filling.
          </p>
          <div className='grid h-10 w-full grid-cols-4 gap-7 border-b-1'>
            <div className='col-span-1 flex items-center ps-3 text-sm font-semibold text-text-secondary'>
              Configuration name
            </div>
            <div className='col-span-1 flex items-center ps-3 text-sm font-semibold text-text-secondary'>
              LLM
            </div>
            <div className='col-span-1 flex items-center ps-3 text-sm font-semibold text-text-secondary'>
              LLM access token
            </div>
            <div className='col-span-1 flex items-center text-sm font-semibold text-text-secondary'>
              System prompt
            </div>
          </div>
          {Object.entries(llmConfigs).map(([id, cfg]) => (
            <LLMConfig key={id} config={{ ...cfg, id }} />
          ))}
          <LLMConfig
            config={{
              id: '',
              name: '',
              model_name: '',
              token_id: '',
              system_prompt: '',
            }}
          />
        </section>

        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>
            Default LLM configurations
          </h3>
          <p className='mb-3 text-sm text-text-addition'>
            The chosen LLM configurations will be the default for prompt
            responses and conditions.
          </p>
          <div className='flex gap-4'>
            <div className='w-1/2'>
              <Select
                data-testid='default-llm-select'
                aria-label='Default llm config'
                labelPlacement='outside'
                placeholder='Select LLM configuration'
                selectedKeys={
                  defaultLlmConfig?.id &&
                  Object.hasOwn(llmConfigs, defaultLlmConfig.id)
                    ? [defaultLlmConfig.id]
                    : []
                }
                onChange={handleDefaultConfigChange}
                radius='sm'
                size='sm'
              >
                {Object.entries(llmConfigs).map(([id, cfg]) => (
                  <SelectItem key={id}>{cfg.name}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </section>
      </ScrolledContainer>
      <Divider className='h-full' orientation='vertical' />
      <PromptRedactor />
    </div>
  )
}

export default Llms
