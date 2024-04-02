import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Xarrow, { Xwrapper, arrowShapes } from 'react-xarrows'
import { useNavigate } from 'react-router-dom';
import { useReactFlow } from 'reactflow';
import { flowContext } from '../contexts/flowContext';
import { NodeType } from '../types/NodeTypes';



const LayoutFlow = () => {

  const { flows, tab } = useContext(flowContext)
  const flow = flows.find((flow) => flow.id === tab)
  const dark = localStorage.getItem("theme") === "dark"
  // const [nodes, setNodes] = useState<NodeType[]>()

  const [edgeColors, setEdgeColors] = useState({
    hovered: dark ? 'white' : 'black',
    no_hovered: dark ? '#555' : '#ddd'
  })

  useEffect(() => {
    setEdgeColors({
      hovered: dark ? 'white' : 'black',
      no_hovered: dark ? '#555' : '#ddd'
    })
  }, [dark])

  // useEffect(() => {
  //   flows.forEach((flow) => setNodes(prev => [...prev, ...flow.data.nodes]))
  // }, [])


  const [nds, setNds] = useState<NodeType[]>(flow.data.nodes.filter((node: NodeType) => node.id !== "LOCAL_NODE" && node.id !== "GLOBAL_NODE") ?? [])
  const [eds, setEds] = useState(flow?.data.edges)
  const navigate = useNavigate()
  // console.log(flow)

  // const goToFlow = (flow: FlowType) => {
  //   setTabId(flow.id)
  //   navigate(`/flow/${flow.id}`)
  // }

  const [hoverNode, setHoverNode] = useState('')

  // const [noTargetNodes, setNoTargetNodes] = useState(flow.data.nodes.filter((node) => !flow.data.edges.some((edge) => edge.target === node.id)))
  // const [strictArray, setStrictArray] = useState<any[]>(noTargetNodes)
  // const findDepsFunction = useCallback((nodes: NodeType[]) => {
  //   let deps = []
  //   // console.log(nodes)
  //   nodes.map((node) => eds.filter((ed) => ed.source === node.id).map((ed) => {
  //     if (!deps.some((n) => n.id === nds.find((nd) => nd.id === ed.target).id)) {
  //       return deps.push(nds.find((node) => node.id === ed.target))
  //     }
  //   }))
  //   // console.log(deps)
  //   if (!deps?.length) {
  //     return -1
  //   }
  //   setStrictArray(prev => [...prev, ...deps])
  //   // console.log(strictArray)
  //   findDepsFunction(deps)
  //   // const depArr = nodes.map((node) => nds.filter((nd) => ) )
  // }, [nds, eds, flow, noTargetNodes])

  // console.log(strictArray)
  // useEffect(() => {
  //   // console.log(noTargetNodes)
  //   findDepsFunction(noTargetNodes)
  // }, [noTargetNodes])

  const HandleTypeIcon = (transitionType: string) => {
    // switch (transitionType) {
    //   case "default": return ''; break;
    //   case "forward": return <TransitionIcons.forward />; break;
    //   case "backward": return <TransitionIcons.backward />; break;
    //   case "repeat": return <TransitionIcons.repeat />; break;
    //   case "previous": return <TransitionIcons.previous />; break;
    //   case "to start": return <TransitionIcons.to_start />; break;
    //   case "to fallback": return <TransitionIcons.to_fallback />; break;
    //     return -1
    // }
    return -1
  }





  const [nodesLayout, setNodesLayout] = useState([])
  const [edgesLayout, setEdgesLayout] = useState<any[]>()
  const [outputLinksLayout, setOutputLinksLayout] = useState<any[]>()


  useEffect(() => {
    setNodesLayout(nds?.filter((node: NodeType) => node.type !== 'link').map((node: NodeType, index, nodes) => (
      <div key={node.id} className='w-max flex flex-col gap-1.5'>
        <div
          onMouseEnter={() => setHoverNode(node.id)}
          onMouseLeave={() => setHoverNode('')}
          id={node.id}
          onClick={node.data.node.base_classes[0] === 'links' ? () => goToFlow(flows.find((flow) => flow.name === node.data.node.links[0].to)) : () => { }}
          // key={node.id}
          className={`py-2 px-4 bg-muted border rounded-lg min-w-[512px] cursor-pointer transition duration-300 strict-mode-item-shadow`}
          style={{ borderColor: node.data.node.base_classes[0] === 'links' && flows.find((flow) => flow.name === node.data.node.links[0].to).color }}
        >
          <h1> {node.data.node.base_classes[0] === 'links' ? (node.data.node.links[0]?.to + ' ' + node.data.node.links[1]?.toName) : node.data.node.display_name} </h1>
        </div>
        <div className='flex flex-row items-start justify-start gap-1.5 w-full'>
          {/* {node.data.node.conditions[0]?.transitionType === 'default' ? '' : node.data.node.conditions[0]?.transitionType} */}
          {node.data.node.conditions?.sort((cond) => cond.transitionType === 'repeat' ? -1 : 1).map(({ transitionType, conditionID }) =>
            transitionType !== 'default'
            &&
            <span
              key={`${node.id}-${conditionID}`}
              id={`${node.id}-${conditionID}`}
              onMouseEnter={() => setHoverNode(`${node.id}-${transitionType}`)}
              onMouseLeave={() => setHoverNode('')}
              style={{
                opacity: (hoverNode === node.id || hoverNode === `${node.id}-${transitionType}`) ? 1 : 0.4,
                transition: 'all',
                transitionDuration: '300ms'
              }}
              className='flex flex-row justify-center text-accent-foreground items-center gap-1 w-max bg-[#FF95001A] text-xs font-bold border-[#FF950020] border px-1 rounded cursor-pointer '>
              {transitionType}
              <span className=''>
                {HandleTypeIcon(transitionType)}
              </span>
            </span>
          )}
        </div>
        {/* {flow.data.edges.filter((edge) => edge.source === node.id).map((edge, idx) => (
      <Xarrow headSize={5} strokeWidth={1} color='gray' _cpx1Offset={index * 5} _cpx2Offset={index * 5} startAnchor={['right']} endAnchor={['right']} path='grid' start={edge.source} end={edge.target} />
    ))} */}
      </div>
    )))

    setOutputLinksLayout(nds.filter((node: NodeType) => node.data.node.base_classes[0] === 'links').map((node: NodeType) => (
      <div key={node.id} className='w-max flex flex-col gap-1.5'>
        <div
          onMouseEnter={() => setHoverNode(node.id)}
          onMouseLeave={() => setHoverNode('')}
          id={node.id}
          onClick={node.data.node.base_classes[0] === 'links' ? () => goToFlow(flows.find((flow) => flow.name === node.data.node.links[0].to)) : () => { }}
          className={`py-2 px-4 bg-muted border rounded-lg min-w-[192px] cursor-pointer transition duration-300 strict-mode-item-shadow`}
          style={{ borderColor: flows.find((flow) => flow.name === node.data.node.links[0]?.to)?.color }}
        >
          <h1> {node.data.node.links[0]?.to}/{flows.find((flow) => flow.name === node.data.node.links[0]?.to).data.nodes.find((nd: NodeType) => nd.id === node.data.node?.links[1]?.to)?.data.node.display_name} </h1>
        </div>
      </div>
    )))

  }, [nds, eds, hoverNode])

  useEffect(() => {
    let left = 4
    let right = 0
    setEdgesLayout(prev => eds.map((edge, idx) => {
      const node_1 = nds.findIndex((node) => node.id === edge.target)
      const node_2 = nds.findIndex((node) => node.id === edge.source)
      const isLeft = node_2 < node_1
      const isTargetLink = nds.find((node: NodeType) => node.id === edge.target).data.node.base_classes[0] === 'links'
      if (isLeft) right += 1
      else left += 1
      return (
        <Xarrow
          key={edge.id}
          zIndex={(hoverNode === edge.source || hoverNode === edge.target) ? 99 : 1}
          headSize={5}
          strokeWidth={1}
          color={(hoverNode === edge.source || hoverNode === edge.target) ? edgeColors.hovered : edgeColors.no_hovered}
          // headShape={"circle"}
          arrowBodyProps={{ className: " transition duration-300 " }}
          arrowHeadProps={{ className: " transition duration-300 " }}
          _cpx1Offset={isLeft ? (right) * 3 : -((left) * 3)}
          _cpx2Offset={isLeft ? (right) * 3 : -((left) * 3)}
          startAnchor={!isLeft ? { position: 'left', offset: { x: -0.002, y: -5 } } : { position: 'right', offset: { y: 5 } }}
          endAnchor={isTargetLink ? 'left' : (!isLeft ? { position: 'left', offset: { x: -0.001, y: 5 } } : { position: 'right', offset: { y: -5 } })}
          path='grid'
          start={edge.source}
          end={edge.target}
        // divContainerStyle={{color: hoverNode === edge.source ? 'black' : '#ddd', transition: 'ease-in-out', transitionDuration: '200ms'}}
        />
      )
    }))
    setEdgesLayout(prev => [...prev, nds.filter((node: NodeType) => node.type !== 'link').map((node: NodeType, idx, arr) => node.data.node.conditions?.filter((cond) => cond.transitionType !== 'default').sort((cond) => cond.transitionType === "repeat" ? -1 : 1).map((cond, index) => {
      const isPrevious = cond.transitionType === 'backward' || cond.transitionType === 'previous'
      const isRepeat = cond.transitionType === 'repeat'
      const isForward = cond.transitionType === 'forward'
      const isStart = cond.transitionType === 'to start'
      const isFallback = cond.transitionType === 'to fallback'
      const parentRect = document.getElementById(`${node.id}`)?.getBoundingClientRect()
      const parentOffset = parentRect?.left
      const parentOffsetWidth = parentRect?.width / 2
      const childRect = document.getElementById(`${node.id}-${cond.conditionID}`)?.getBoundingClientRect()
      const currChildOffset = childRect?.left
      const currChildOffsetWidth = childRect?.width / 2
      const offsetLeft = currChildOffset - parentOffset - parentOffsetWidth + currChildOffsetWidth
      if (isPrevious) {
        return (
          <Xarrow
            key={`${node.id}-${cond.conditionID}`}
            headSize={5}
            strokeWidth={1}
            color={(hoverNode === node.id || hoverNode === `${node.id}-${cond.transitionType}`) ? edgeColors.hovered : '#fff0'}
            dashness
            arrowBodyProps={{ className: " transition duration-300 " }}
            arrowHeadProps={{ className: " transition duration-300 " }}
            startAnchor={'top'}
            endAnchor={{ position: "bottom", offset: { x: offsetLeft, y: 0 } }}
            path='grid'
            gridBreak='20%10'
            // _cpx1Offset={-((index + 1) * 4)}
            // _cpx2Offset={-((index + 1) * 4)}
            _cpy1Offset={0}
            _cpy2Offset={0}
            start={`${node.id}-${cond.conditionID}`}
            end={isPrevious ? arr[idx - 1].id : ''}
          />
        )
      } else if (isRepeat) {
        return (
          <Xarrow
            key={`${node.id}-${cond.conditionID}`}
            headSize={5}
            strokeWidth={1}
            color={(hoverNode === node.id || hoverNode === `${node.id}-${cond.transitionType}`) ? edgeColors.hovered : '#fff0'}
            dashness
            arrowBodyProps={{ className: " transition duration-300 " }}
            arrowHeadProps={{ className: " transition duration-300 " }}
            startAnchor={{ position: "left", offset: { x: -0.002 } }}
            endAnchor={{ position: "left", offset: { x: -0.001 } }}
            path='grid'
            // _cpx1Offset={-((index + 1) * 4)}
            _cpx1Offset={-10}
            _cpx2Offset={-10}
            _cpy1Offset={0}
            _cpy2Offset={0}
            start={`${node.id}-${cond.conditionID}`}
            end={isRepeat ? arr[idx].id : ''}
          />
        )
      } else if (isForward) {
        return (
          <Xarrow
            key={`${node.id}-${cond.conditionID}`}
            headSize={5}
            strokeWidth={1}
            color={(hoverNode === node.id || hoverNode === `${node.id}-${cond.transitionType}`) ? edgeColors.hovered : '#fff0'}
            dashness
            arrowBodyProps={{ className: " transition duration-300 " }}
            arrowHeadProps={{ className: " transition duration-300 " }}
            startAnchor={'bottom'}
            endAnchor={{ position: "top", offset: { x: offsetLeft, y: 0 } }}
            path='grid'
            gridBreak='20%10'
            // _cpx1Offset={-((index + 1) * 4)}
            // _cpx2Offset={-((index + 1) * 4)}
            _cpy1Offset={0}
            _cpy2Offset={0}
            start={`${node.id}-${cond.conditionID}`}
            end={isForward ? arr[idx + 1]?.id : ''}
          />
        )
      }
    }))])
  }, [nodesLayout, outputLinksLayout, hoverNode])

  // const depsArray = noTargetNodes.map((node) => {

  // })

  // console.log(noTargetNodes)

  // console.log(edgesLayout)


  return (
    <Xwrapper>
      <div className='absolute z-50 p-4 top-0 left-0 w-full h-full bg-background flex flex-row gap-24 items-start justify-center'>
        <div className=' flex flex-col items-center justify-start gap-4 '>
          {nodesLayout}
          {edgesLayout}
        </div>
        <div className=' flex flex-col items-center justify-start gap-4 '>
          {outputLinksLayout}
        </div>
      </div>
    </Xwrapper>
  );
};
export default LayoutFlow;