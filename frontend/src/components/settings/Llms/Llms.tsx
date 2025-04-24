import { LlmContext } from '@/contexts/llmContext'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { Divider } from '@nextui-org/react'
import React, { useContext } from 'react'
// import LLMConfig from './LLMConfig'
import LLMToken from './LLMToken'

const Llms = () => {
  const { tokens, llmConfigs } = useContext(LlmContext)

  return (
    <div className='flex h-full w-full items-start justify-start gap-9'>
      <ScrolledContainer scrollbarOffset={20} className='basis-7/12'>
        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>LLM access tokens</h3>
          <p className='mb-6 text-sm text-neutral-400'>
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

          {tokens.map((t) => (
            <LLMToken key={t.name} token={t} />
          ))}
          <LLMToken
            token={{
              name: '',
              provider: '',
              value: '',
            }}
          />
        </section>

        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>
            Your LLM configurations
          </h3>
          <p className='mb-6 text-sm text-neutral-400'>
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

          {/* {llmConfigs.map((t) => (
            <LLMConfig key={t.id} config={t} />
          ))}
          <LLMConfig /> */}
        </section>

        <section className='mb-6'>
          <h3 className='text-md mb-1 font-semibold'>
            Default LLM configurations
          </h3>
          <p className='mb-6 text-sm text-neutral-400'>
            The chosen LLM configurations will be the default for prompt
            responses and conditions, and slot filling.
          </p>
        </section>
      </ScrolledContainer>
      <Divider className='h-full' orientation='vertical' />
      {/* <div>prompt redactor</div> */}
    </div>
  )
}

export default Llms
