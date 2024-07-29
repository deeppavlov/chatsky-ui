import { Button, Tooltip } from "@nextui-org/react"
import classNames from "classnames"
import { useContext, useMemo } from "react"
import { Node, useReactFlow } from "reactflow"
import { flowContext } from "../../../contexts/flowContext"
import { workspaceContext } from "../../../contexts/workspaceContext"
import FallbackNodeIcon from "../../../icons/nodes/FallbackNodeIcon"
import StartNodeIcon from "../../../icons/nodes/StartNodeIcon"
import { FlowType } from "../../../types/FlowTypes"
import { NodeDataType } from "../../../types/NodeTypes"

const NodeInstruments = ({ flow }: { flow: FlowType }) => {
  const { setNodes } = useReactFlow()
  const { handleNodeFlags, selectedNode } = useContext(workspaceContext)
  const { deleteNode } = useContext(flowContext)

  const selectedNodeData: Node<NodeDataType> | null =
    flow?.data.nodes.find((node) => node.id === selectedNode) ?? null

  const is_node_default = useMemo(() => selectedNodeData?.type === "default_node", [selectedNodeData])

  const deleteSelectedNodeHandler = () => {
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode))
    deleteNode(selectedNode)
  }

  if (!is_node_default) return <></>

  return (
    <div className='flex items-center gap-1'>
      <Tooltip
        key={"header-button-set-start"}
        content='Select node as Start'
        radius='sm'>
        <Button
          onClick={(e) => handleNodeFlags(e, setNodes)}
          isIconOnly
          name='start'
          className={classNames(
            "rounded-small bg-background border border-border hover:bg-overlay hover:border-border-darker",
            selectedNodeData?.data.flags?.includes("start") && "border-success hover:bg-success-50"
          )}>
          <StartNodeIcon />
        </Button>
      </Tooltip>
      <Tooltip
        key={"header-button-set-fallback"}
        content='Select node as Fallback'
        radius='sm'>
        <Button
          onClick={(e) => handleNodeFlags(e, setNodes)}
          isIconOnly
          name='fallback'
          className={classNames(
            "rounded-small bg-background border border-border hover:bg-overlay hover:border-border-darker",
            selectedNodeData?.data.flags?.includes("fallback") && "border-danger hover:bg-fallback-50"
          )}>
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
