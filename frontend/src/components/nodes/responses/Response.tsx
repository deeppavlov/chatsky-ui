import { BotIcon } from '../../../icons/nodes/responses/BotIcon'
import { NodeComponentType } from '../../../types/NodeTypes'

const Response = ({ data }: NodeComponentType) => {

 const text = data.response.data[0]?.text ?? ''

 const mapping: { [key: string]: string } = {
  text: text === '' ? 'No text response' : text,
  python: data.response.name,
 }

 const responseText = mapping[data.response.type]

 return (
  <div className="w-full flex items-center justify-start text-start">
   <BotIcon className="ml-1" />
   <p className="ml-2 w-full rounded text-base">{responseText}</p>
  </div>
 )
}

export default Response
