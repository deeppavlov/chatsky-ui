import { BotIcon } from "../../../icons/nodes/responses/BotIcon"
import { NodeComponentType } from "../../../types/NodeTypes"

const Response = ({ data }: NodeComponentType) => {
  return (
    <div className='w-full flex items-center justify-start text-start'>
      <BotIcon className="ml-1" />
      <p className='w-full bg-node p-2 rounded text-base'>{data.response?.data[0]?.text ?? "No text response"}</p>
    </div>
  )
}

export default Response
