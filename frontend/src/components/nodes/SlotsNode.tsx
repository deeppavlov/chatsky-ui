import { Button } from "@nextui-org/react"
import { PlusIcon } from "lucide-react"
import { memo, useContext, useState } from "react"
import { PopUpContext } from "../../contexts/popUpContext"
import SlotsConditionIcon from "../../icons/nodes/conditions/SlotsConditionIcon"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import SlotsGroupModal from "../../modals/SlotsModals/SlotsGroupModal"
import SlotsNodeModal from "../../modals/SlotsModals/SlotsNodeModal"
import { SlotsNodeDataType } from "../../types/NodeTypes"
import SlotsGroup from "./slots/SlotsGroup"

const SlotsNode = memo(({ data }: { data: SlotsNodeDataType }) => {
  const { openPopUp } = useContext(PopUpContext)
  const [nodeData, setNodeData] = useState(data)


  const onNodeModalOpen = () => {
    openPopUp(
      <SlotsNodeModal
        data={nodeData}
        setData={setNodeData}
      />,
      "slots-node-modal"
    )
  }

  const handleNewGroupModalOpen = () => {
    openPopUp(
      <SlotsGroupModal
        id='slots-group-modal-create-from-node'
        data={nodeData}
        setData={setNodeData}
        group={null}
        is_create={true}
      />,
      "slots-group-modal-create-from-node"
    )
  }

  return (
    <>
      <div
        id={nodeData.id}
        data-testid={nodeData.id}
        className='default_node'>
        <div className='custom-drag-handle w-full flex justify-between items-center bg-node-header border-b border-border rounded-t-node pl-6 pr-4 py-2'>
          <div className='flex items-center justify-start gap-1.5'>
            <SlotsConditionIcon />
            <p>{nodeData.name}</p>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <Button
              onClick={onNodeModalOpen}
              className='min-h-0 min-w-0 p-0 w-10 h-10'
              variant='light'
              isIconOnly>
              <EditNodeIcon />
            </Button>
          </div>
        </div>
        <div className='p-2.5 w-full'>
          <p className='text-neutral-500 text-sm text-start mb-2.5 ml-2.5'>
            {data.description && data.description?.length
              ? data.description
              : "Collect client's data to fulfill their requests"}
          </p>
          <div className='flex flex-col items-center justify-center gap-2 mb-3'>
            {nodeData.groups &&
              nodeData.groups.map((group) => (
                <SlotsGroup
                  data={nodeData}
                  setData={setNodeData}
                  group={group}
                  key={group.id}
                />
              ))}
          </div>
          <button
            onClick={handleNewGroupModalOpen}
            data-testid={`${nodeData.name.toLowerCase().replace(" ", "")}-add-group-btn`}
            className='w-full bg-node border border-border flex items-center justify-center gap-2 py-1 rounded-lg'>
            <PlusIcon color='var(--foreground)' />
            Add group
          </button>
        </div>
      </div>
    </>
  )
})

export default SlotsNode
