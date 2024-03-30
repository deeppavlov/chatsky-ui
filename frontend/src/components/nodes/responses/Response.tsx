import React from "react"
import { NodeComponentType } from "../../../types/NodeTypes"
import { BotIcon } from "../../../icons/nodes/responses/BotIcon"

const Response = ({ data }: NodeComponentType) => {
  return (
    <div className='w-full flex items-center justify-start text-start'>
      <BotIcon className="ml-1" />
      <p className='w-full bg-node p-2 rounded text-base'>{data.response}</p>
    </div>
  )
}

export default Response
