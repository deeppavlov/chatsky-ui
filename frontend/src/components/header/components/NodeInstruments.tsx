import { Tooltip } from '@/UI/Tooltip'
import { Button } from '@nextui-org/react'
import { Edge, useReactFlow } from '@xyflow/react'
import classNames from 'classnames'
import { useContext } from 'react'
import { flowContext } from '../../../contexts/flowContext'
import { workspaceContext } from '../../../contexts/workspaceContext'
import FallbackNodeIcon from '../../../icons/nodes/FallbackNodeIcon'
import StartNodeIcon from '../../../icons/nodes/StartNodeIcon'
import { FlowType } from '../../../types/FlowTypes'
import { AppNode } from '../../../types/NodeTypes'

const NodeInstruments = ({ flow }: { flow: FlowType }) => {
  const { setNodes } = useReactFlow<AppNode, Edge>()
  const { handleNodeFlags, selectedNode } = useContext(workspaceContext)
  const { deleteNode } = useContext(flowContext)

  const selectedNodeData: AppNode | null =
    flow?.data.nodes.find((node) => node.id === selectedNode) ?? null

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteSelectedNodeHandler = () => {
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode))
    deleteNode(selectedNode)
  }

  if (selectedNodeData?.type !== 'default_node') return <></>

  return (
    <div className='flex items-center gap-1'>
      <Tooltip
        content='Select node as Start'
        classNames={{ content: '!text-sm' }}
        side='bottom'
        sideOffset={4}
      >
        <Button
          onClick={(e) => handleNodeFlags(e, setNodes)}
          isIconOnly
          name='start'
          className={classNames(
            'rounded-small border border-border bg-background hover:border-border-darker hover:bg-overlay',
            selectedNodeData?.data.flags?.includes('start') &&
              'hover:bg-success-50 border-success',
          )}
        >
          <StartNodeIcon />
        </Button>
      </Tooltip>
      <Tooltip
        content='Select node as Fallback'
        classNames={{ content: '!text-sm' }}
        side='bottom'
        sideOffset={4}
      >
        <Button
          onClick={(e) => handleNodeFlags(e, setNodes)}
          isIconOnly
          name='fallback'
          className={classNames(
            'rounded-small border border-border bg-background hover:border-border-darker hover:bg-overlay',
            selectedNodeData?.data.flags?.includes('fallback') &&
              'hover:bg-fallback-50 border-danger',
          )}
        >
          <FallbackNodeIcon />
        </Button>
      </Tooltip>
      {/* <Tooltip
        key={"header-button-delete"}
        content='Delete node'
        color='danger'
        radius='sm'>
        <Button
          data-testid="header-button-delete-node"
          onClick={deleteSelectedNodeHandler}
          isIconOnly
          className='rounded-small bg-background border border-border hover:border-danger'>
          <Trash2 />
        </Button>
      </Tooltip> */}
    </div>
  )
}

export default NodeInstruments
