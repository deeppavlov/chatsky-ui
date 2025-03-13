import { Button, useDisclosure, Tooltip } from '@nextui-org/react'
import { Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import classNames from 'classnames'
import { PlusIcon } from 'lucide-react'
import { memo, useContext, useMemo, useState } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'

import EditNodeIcon from '../../icons/nodes/EditNodeIcon'
import FallbackNodeIcon from '../../icons/nodes/FallbackNodeIcon'
import GlobalNodeIcon from '../../icons/nodes/GlobalNodeIcon'
import LocalNodeIcon from '../../icons/nodes/LocalNodeIcon'
import StartNodeIcon from '../../icons/nodes/StartNodeIcon'
import '../../index.css'
import ConditionModal from '../../modals/ConditionModal/ConditionModal'
import NodeModal from '../../modals/NodeModal/NodeModal'
import ResponseModal from '../../modals/ResponseModal/ResponseModal'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import Condition from './conditions/Condition'
import Response from './responses/Response'

const DefaultNode = memo(({ data }: { data: DefaultNodeDataType }) => {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const { openPopUp } = useContext(PopUpContext)

 const [nodeDataState, setNodeDataState] = useState<DefaultNodeDataType>(data)

 const {
  onOpen: onNodeOpen,
  onClose: onNodeClose,
  isOpen: isNodeOpen,
 } = useDisclosure()
 const {
  onOpen: onResponseOpen,
  onClose: onResponseClose,
  isOpen: isResponseOpen,
 } = useDisclosure()

 const onConditionModalOpen = () => {
  openPopUp(
   <ConditionModal id="condition-modal" data={data} is_create />,
   'condition-modal'
  )
 }

 const validate_node = useMemo(
  () => data.response?.data.length && data.conditions?.length,
  [data.conditions?.length, data.response?.data.length]
 )

 console.log(data.flags, 'flags')

 return (
  <>
   <div id={data.id} data-testid={data.id} className="default_node">
    <div className="custom-drag-handle w-full flex justify-between items-center bg-node-header border-b border-border rounded-t-node pl-[23px] pr-[18px] py-2 gap-[8px]">
     <div className="flex ">
      {data.flags?.includes('start') && (
       <Tooltip
        placement="bottom"
        radius="sm"
        content="Start node"
        className="px-[12px] py-[8px]"
       >
        <div className="bg-transparent border-none">
         <StartNodeIcon />
        </div>
       </Tooltip>
      )}

      {data.flags?.includes('fallback') && (
       <Tooltip
        placement="bottom"
        radius="sm"
        content="Fallback node"
        className="px-[12px] py-[8px]"
       >
        <div className="bg-transparent border-none">
         <FallbackNodeIcon />
        </div>
       </Tooltip>
      )}
     </div>

     <div className="flex items-center w-full">
      {!data.id.includes('LOCAL_NODE') && !data.id.includes('GLOBAL_NODE') && (
       <Handle
        isConnectableEnd
        position={Position.Left}
        type="target"
        style={{
         background: 'var(--background)',
         borderWidth: '2px',
         borderColor: 'var(--condition-input-handle)',
         borderStyle: 'solid',
         width: '0.7rem',
         height: '0.7rem',
         top: '1.875rem',
         left: '0rem',
         zIndex: 10,
        }}
       />
      )}
      <p
       className="font-medium text-medium flex items-center gap-1 truncate w-[218px]"
       style={{ display: 'block', textAlign: 'left' }}
      >
       {data.id.includes('LOCAL_NODE') && <LocalNodeIcon />}
       {data.id.includes('GLOBAL_NODE') && <GlobalNodeIcon />}
       {data.name}
      </p>
     </div>
     <div className="flex items-center justify-end gap-1">
      <Button
       className="min-h-0 min-w-0 p-0 w-10 h-10"
       variant="light"
       isIconOnly
       onClick={onNodeOpen}
      >
       <EditNodeIcon />
      </Button>
      <span
       className={classNames(
        'flex w-5 h-5 rounded-full',
        validate_node ? 'bg-success' : 'bg-warning'
       )}
      />
     </div>
    </div>
    <div className="cursor-default w-full flex flex-col items-center justify-center gap-2 p-2.5 ">
     <div
      className="cursor-pointer w-full flex items-center justify-start border border-border rounded-lg py-2 px-2 mb-1 transition-colors hover:border-node-selected"
      onClick={onResponseOpen}
     >
      <Response data={data} />
     </div>
     <div className="w-full flex flex-col gap-2">
      {data.conditions?.map((condition) => (
       <Condition key={condition.id} data={data} condition={condition} />
      ))}
     </div>
     <button
      data-testid={`${data.name
       .toLowerCase()
       .replace(' ', '')}-add-condition-btn`}
      onClick={onConditionModalOpen}
      className="add-cnd-btn"
     >
      <PlusIcon color="var(--condition-default)" />
     </button>
    </div>
   </div>
   <NodeModal
    data={data}
    isOpen={isNodeOpen}
    onClose={onNodeClose}
    onResponseModalOpen={onResponseOpen}
    nodeDataState={nodeDataState}
    setNodeDataState={setNodeDataState}
   />
   <ResponseModal
    data={nodeDataState}
    setData={setNodeDataState}
    isOpen={isResponseOpen}
    onClose={onResponseClose}
    response={nodeDataState.response!}
   />
  </>
 )
})

export default DefaultNode
