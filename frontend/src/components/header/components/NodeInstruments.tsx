import { Button, Tooltip } from "@nextui-org/react"
import React, { useContext } from "react"
import { useReactFlow } from "reactflow"
import { workspaceContext } from "../../../contexts/workspaceContext"
import { FlowType } from "../../../types/FlowTypes"
import { NodeDataType } from "../../../types/NodeTypes"
import classNames from "classnames"

const NodeInstruments = ({ flow }: { flow: FlowType }) => {
  const { setNodes } = useReactFlow()
  const { handleNodeFlags, selectedNode } = useContext(workspaceContext)

  const selectedNodeData: NodeDataType =
    flow?.data.nodes.find((node) => node.id === selectedNode)?.data ?? null

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
            selectedNodeData?.flags?.includes("start") && "bg-success hover:bg-success-50"
          )}>
          S
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
            selectedNodeData?.flags?.includes("fallback") && "bg-danger hover:bg-fallback-50"
          )}>
          F
        </Button>
      </Tooltip>
      <Tooltip
        key={"header-button-delete"}
        content='Delete node'
        color='danger'
        radius='sm'>
        <Button
          isIconOnly
          className='rounded-small bg-background border border-border hover:bg-danger hover:border-border-darker'>
          D
        </Button>
      </Tooltip>
    </div>
  )
}

export default NodeInstruments
