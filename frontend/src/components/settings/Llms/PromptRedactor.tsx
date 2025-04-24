import { updateLlmConfig } from '@/api/llm'
import { LlmContext } from '@/contexts/llmContext'
import EditPenIcon from '@/icons/EditPenIcon'
import EditNodeIcon from '@/icons/nodes/EditNodeIcon'
import { Button } from '@nextui-org/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useContext, useEffect, useRef, useState } from 'react'

const PromptRedactor = () => {
  const { editingConfig, setEditingConfig, setLlmConfigs } =
    useContext(LlmContext)
  const [prompt, setPrompt] = useState(editingConfig?.system_prompt || '')

  const onCancel = () => {
    setEditingConfig(null)
    setPrompt('')
  }

  const onSave = () => {
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        system_prompt: prompt,
      })

      updateLlmConfig(editingConfig.name, { system_prompt: prompt })
      setLlmConfigs((prev) =>
        prev.map((item) => {
          if (item.name === editingConfig?.name) {
            return { ...item, system_prompt: prompt }
          }
          return item
        }),
      )
    }
    setEditingConfig(null)
  }

  useEffect(() => {
    if (editingConfig) {
      setPrompt(editingConfig?.system_prompt || '')
    }
    inputRef.current?.focus()
  }, [editingConfig])

  const inputRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className='relative h-full basis-5/12'>
      <AnimatePresence mode='wait'>
        {!editingConfig ? (
          <motion.div
            key='empty'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className='absolute inset-0 flex items-center justify-center gap-2'
          >
            <EditNodeIcon />
            <span className='text-base text-text-secondary'>
              Select an item to configure.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key='editor'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className='absolute inset-0 flex h-full w-full flex-col gap-6'
          >
            <section>
              <div className='mb-1 flex items-center justify-start gap-2'>
                <EditPenIcon className='stroke-text-secondary' />
                <h3 className='text-md font-semibold'>
                  System prompt{' '}
                  <span className='font-normal'>— {editingConfig.name}</span>
                </h3>
              </div>
              <p className='text-sm text-text-addition'>
                Create your prompt. Prompts can help guide the behavior of a
                Language Model.
              </p>
            </section>

            <div className='flex-grow'>
              <textarea
                ref={inputRef}
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                className='h-full w-full resize-none rounded-[10px] border-1 border-input-border bg-background p-3 text-sm scrollbar-hide placeholder:text-text-addition focus:border-contrast-border focus:outline-none'
                placeholder='Enter your prompt...'
              />
            </div>

            <div className='flex w-full justify-end gap-3'>
              <Button className='h-[40px] rounded-lg px-4' onClick={onCancel}>
                Cancel
              </Button>
              <Button
                className='h-[40px] rounded-lg bg-black px-4 text-white'
                onClick={onSave}
              >
                Save prompt
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    // <div className='h-full basis-5/12'>
    //   {!editingConfig ? (
    //     <div className='flex h-full w-full items-center justify-center gap-2'>
    //       <EditNodeIcon />
    //       <span className='text-base text-text-secondary'>
    //         Select an item to configure.
    //       </span>
    //     </div>
    //   ) : (
    //     <div className='flex h-full w-full flex-col gap-6'>
    //       <section>
    //         <div className='mb-1 flex items-center justify-start gap-2'>
    //           <EditPenIcon className='stroke-text-secondary' />
    //           <h3 className='text-md font-semibold'>
    //             System prompt{' '}
    //             <span className='font-normal'>— {editingConfig.name}</span>
    //           </h3>
    //         </div>
    //         <p className='text-sm text-text-addition'>
    //           Create your prompt. Prompts can help guide the behavior of a
    //           Language Model.
    //         </p>
    //       </section>

    //       <div className='flex-grow'>
    //         <textarea
    //           ref={inputRef}
    //           onChange={(e) => setPrompt(e.target.value)}
    //           value={prompt}
    //           className='h-full w-full resize-none rounded-[10px] border-1 border-input-border bg-background p-3 text-sm scrollbar-hide placeholder:text-text-addition focus:border-contrast-border focus:outline-none'
    //           placeholder='Enter your prompt...'
    //         />
    //       </div>

    //       <div className='flex w-full justify-end gap-3'>
    //         <Button className='h-[40px] rounded-lg px-4' onClick={onCancel}>
    //           Cancel
    //         </Button>
    //         <Button
    //           className='h-[40px] rounded-lg bg-black px-4 text-white'
    //           onClick={onSave}
    //         >
    //           Save prompt
    //         </Button>
    //       </div>
    //     </div>
    //   )}
    // </div>
  )
}

export default PromptRedactor
