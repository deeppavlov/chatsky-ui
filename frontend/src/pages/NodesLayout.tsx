/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  MouseEventHandler,
  useState
} from "react"
import Xarrow, { Xwrapper } from "react-xarrows"
import { useEdges, useNodes } from "reactflow"
import { NodeType } from "../types/NodeTypes"

const NodesLayout = () => {
  // const { flows } = useContext(flowContext)
  // const flowId = useLocation().pathname.split("/")[useLocation().pathname.split("/").length - 1]
  // const flow = flows.find((flow) => flow.id === flowId)

  // @ts-ignore
  const nodes: NodeType[] = useNodes().filter(
    (node) =>
      // @ts-ignore
      node.type !== "link" && node.data.name !== "LOCAL NODE" && node.data.name !== "GLOBAL NODE"
  )
  const edges = useEdges()
  const [hoveredNode, setHoveredNode] = useState<string>("")
  const setHoveredNodeHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    const id = (e.target as HTMLElement).id
    setHoveredNode(id)
  }
  const resetHoveredNodeHandler: MouseEventHandler<HTMLDivElement> = () => {
    setHoveredNode("")
  }

  return (
    <div className='w-screen h-screen top-0 left-0 bg-background absolute pt-20 grid grid-cols-6'>
      <span className='col-span-2'></span>
      <div className='col-span-2 bg-background flex flex-col gap-6'>
        <Xwrapper>
          {nodes.map((node) => (
            <div
              key={node.id}
              className='flex flex-col gap-1'>
              <div
                id={`${node.id}-layout`}
                onMouseEnter={setHoveredNodeHandler}
                onMouseLeave={resetHoveredNodeHandler}
                className='p-2 border border-border rounded-lg cursor-pointer hover:border-foreground'>
                {node.data.name}
              </div>
              <div className="grid grid-cols-6 items-center gap-2">
                {node.data.conditions &&
                  node.data.conditions.map((condition) => (
                    <>
                      {condition.data.transition_type !== "manual" && (
                        <div style={{
                          opacity: hoveredNode === node.id ? 1 : 0.5
                        }} className='px-1 transition border-1.5 text-sm font-medium border-[#FF950055] bg-[#FF95001A] w-full text-center rounded-lg'>
                          {condition.data.transition_type}
                        </div>
                      )}
                    </>
                  ))}
              </div>
            </div>
          ))}
          {edges.map((edge, idx) => {
            const target = nodes.findIndex((n) => n.id === edge.target)
            const source = nodes.findIndex((n) => n.id === edge.source)
            if (!(target + 1) || !(source + 1)) return
            const isLeft = source < target
            return (
              <Xarrow
                key={edge.id}
                start={`${edge.source}-layout`}
                end={`${edge.target}-layout`}
                headSize={5}
                strokeWidth={1}
                color={hoveredNode === `${edge.source}-layout` ? "var(--foreground)" : "var(--border)"}
                path='grid'
                _cpy1Offset={0}
                _cpy2Offset={0}
                _cpx1Offset={isLeft ? -5 - idx * 1.5 : 5 + idx * 1.5}
                _cpx2Offset={isLeft ? -5 - idx * 1.5 : 5 + idx * 1.5}
                endAnchor={{
                  position: isLeft ? "left" : "right",
                  offset: { x: isLeft ? 0.001 : -0.001, y: isLeft ? -2.5 : 2.5 },
                }}
                startAnchor={{
                  position: isLeft ? "left" : "right",
                  offset: { x: 0, y: isLeft ? 2.5 : -2.5 },
                }}
              />
            )
          })}
        </Xwrapper>
      </div>
      <div className='col-span-2'></div>
    </div>
  )
}

export default NodesLayout
