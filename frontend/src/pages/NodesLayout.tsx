/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEdges, useNodes } from '@xyflow/react'
import { MouseEventHandler, useState } from 'react'
import Xarrow, { Xwrapper } from 'react-xarrows'
import { AppNode } from '../types/NodeTypes'

const NodesLayout = () => {
  // const { flows } = useContext(flowContext)
  // const flowId = useLocation().pathname.split("/")[useLocation().pathname.split("/").length - 1]
  // const flow = flows.find((flow) => flow.id === flowId)

  // @ts-ignore
  const nodes: AppNode[] = useNodes().filter(
    (node) =>
      // @ts-ignore
      node.type !== "link" && node.data.name !== "LOCAL NODE" && node.data.name !== "GLOBAL NODE" && node.data.name !== "Slots"

  )
  const edges = useEdges()
  const [hoveredNode, setHoveredNode] = useState<string>('')
  const setHoveredNodeHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    const id = (e.target as HTMLElement).id
    setHoveredNode(id)
  }
  const resetHoveredNodeHandler: MouseEventHandler<HTMLDivElement> = () => {
    setHoveredNode('')
  }

  return (
    <div className='absolute left-0 top-0 grid h-screen w-screen grid-cols-6 bg-background pt-20'>
      <span className='col-span-2'></span>
      <div className='col-span-2 flex flex-col gap-6 bg-background'>
        <Xwrapper>
          {nodes.map((node) => (
            <div key={node.id} className='flex flex-col gap-1'>
              <div
                id={`${node.id}-layout`}
                onMouseEnter={setHoveredNodeHandler}
                onMouseLeave={resetHoveredNodeHandler}
                className='cursor-pointer rounded-lg border border-border p-2 hover:border-foreground'
              >
                {node.data.name}
              </div>
              <div className='grid grid-cols-6 items-center gap-2'>
                {node.type === 'default_node' &&
                  node.data.conditions &&
                  node.data.conditions.map((condition) => (
                    <>
                      {condition.data.transition_type !== 'manual' && (
                        <div
                          style={{
                            opacity: hoveredNode === node.id ? 1 : 0.5,
                          }}
                          className='w-full rounded-lg border-1.5 border-[#FF950055] bg-[#FF95001A] px-1 text-center text-sm font-medium transition'
                        >
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
                color={
                  hoveredNode === `${edge.source}-layout`
                    ? 'var(--foreground)'
                    : 'var(--border)'
                }
                path='grid'
                _cpy1Offset={0}
                _cpy2Offset={0}
                _cpx1Offset={isLeft ? -5 - idx * 1.5 : 5 + idx * 1.5}
                _cpx2Offset={isLeft ? -5 - idx * 1.5 : 5 + idx * 1.5}
                endAnchor={{
                  position: isLeft ? 'left' : 'right',
                  offset: {
                    x: isLeft ? 0.001 : -0.001,
                    y: isLeft ? -2.5 : 2.5,
                  },
                }}
                startAnchor={{
                  position: isLeft ? 'left' : 'right',
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
