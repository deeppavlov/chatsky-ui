import { Edge, ReactFlow, ReactFlowProps } from '@xyflow/react'
import { AppNode } from '../types/NodeTypes'

const ReactFlowCustom = ({ ...props }: ReactFlowProps<AppNode, Edge>) => {
  return (
    <ReactFlow {...props}>
      {props.children}
    </ReactFlow>
  )
}

export default ReactFlowCustom