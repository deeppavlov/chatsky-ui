import { Button } from '@nextui-org/react'
import { PlusIcon } from 'lucide-react'
import { memo, useContext, useState } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import SlotsConditionIcon from '../../icons/nodes/conditions/SlotsConditionIcon'
import EditNodeIcon from '../../icons/nodes/EditNodeIcon'
import SlotsGroupModal from '../../modals/SlotsModals/SlotsGroupModal'
import SlotsNodeModal from '../../modals/SlotsModals/SlotsNodeModal'
import { SlotsNodeDataType } from '../../types/NodeTypes'
import SlotsGroup from './slots/SlotsGroup'

const SlotsNode = memo(({ data }: { data: SlotsNodeDataType }) => {
  const { openPopUp } = useContext(PopUpContext)
  const [nodeData, setNodeData] = useState(data)

  const onNodeModalOpen = () => {
    openPopUp(
      <SlotsNodeModal data={nodeData} setData={setNodeData} />,
      'slots-node-modal',
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
      'slots-group-modal-create-from-node',
    )
  }

  return (
    <>
      <div id={nodeData.id} data-testid={nodeData.id} className='default_node'>
        <div className='custom-drag-handle flex w-full items-center justify-between rounded-t-node border-b border-border bg-node-header py-2 pl-6 pr-4'>
          <div className='flex items-center justify-start gap-1.5'>
            <SlotsConditionIcon />
            <p>{nodeData.name}</p>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <Button
              onClick={onNodeModalOpen}
              className='h-10 min-h-0 w-10 min-w-0 p-0'
              variant='light'
              isIconOnly
            >
              <EditNodeIcon />
            </Button>
          </div>
        </div>
        <div className='w-full p-2.5'>
          <p className='mb-2.5 ml-2.5 text-start text-sm text-neutral-500'>
            {data.description && data.description?.length
              ? data.description
              : "Collect client's data to fulfill their requests"}
          </p>
          <div className='mb-3 flex flex-col items-center justify-center gap-2'>
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
            data-testid={`${nodeData.name.toLowerCase().replace(' ', '')}-add-group-btn`}
            className='flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-node py-1'
          >
            <PlusIcon color='var(--foreground)' />
            Add group
          </button>
        </div>
      </div>
    </>
  )
})

export default SlotsNode
