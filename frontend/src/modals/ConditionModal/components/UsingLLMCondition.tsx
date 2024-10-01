import { Input, Select, SelectItem, Textarea } from "@nextui-org/react"
import React, { useEffect, useMemo } from "react"
import { ConditionModalContentType } from "../ConditionModal"

const UsingLLMConditionSection = ({
  condition,
  setData,
}: ConditionModalContentType) => {
  const modelNames = useMemo(() => ["gpt-3", "gpt-3.5-turbo", "gpt-4"], [])

  useEffect(() => {
    if (!condition.data.llm) {
      setData({
        ...condition,
        type: "llm",
        data: {
          ...condition.data,
          llm: {
            model_name: "",
            api_key: "",
            prompt: "",
          },
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeConditionValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setData({
      ...condition,
      type: "llm",
      data: {
        ...condition.data,
        llm: {
          ...condition.data.llm!,
          [e.target.name]: e.target.value,
        },
      },
    })
  }
  return (
    <div className='mt-2 w-full flex flex-col items-start justify-start gap-4'>
      <div className='grid grid-cols-2 gap-4 w-full'>
        <Select
          label='Model name'
          name='model_name'
          onChange={changeConditionValue}
          value={condition.data.llm?.model_name}
          placeholder='Select a model'
          labelPlacement='outside'>
          {modelNames.map((modelName) => (
            <SelectItem
              key={modelName}
              value={modelName}>
              {modelName}
            </SelectItem>
          ))}
        </Select>
        <Input
          label='API Key'
          placeholder='Enter your API key'
          labelPlacement='outside'
          name='api_key'
          onChange={changeConditionValue}
          value={condition.data.llm?.api_key}
        />
      </div>
      <Textarea
        label='Prompt'
        labelPlacement='outside'
        placeholder='Enter your prompt'
        classNames={{
          input: "h-max",
        }}
        name='prompt'
        onChange={changeConditionValue}
        value={condition.data.llm?.prompt}
      />
      <Textarea
        label='Condition satisfaction triggers'
        labelPlacement='outside'
        placeholder='# if the following is true, the condition is satisfied'
        classNames={{
          input: "h-max",
        }}
      />
    </div>
  )
}

export default UsingLLMConditionSection
