import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PopUpContext } from '../../../../contexts/popUpContext'
import { TabsContext } from '../../../../contexts/tabsContext'
import { LinkClassType } from '../../../../types/api'
import { NodeDataType } from '../../../../types/flow'
import { classNames } from '../../../../utils'
import { LinkComponent } from '../linkComponent'

export const LinksListComponent = ({ links, data, className }: { links: LinkClassType[], data: NodeDataType, className?: string }) => {

  const [nodesDisabled, setNodesDisabled] = useState(true)
  const [conditionsDisabled, setConditionsDisabled] = useState(true)
  const { flows, tabId } = useContext(TabsContext)
  const { closePopUp } = useContext(PopUpContext)

  const flow = flows.filter((flow) => flow.id == tabId)[0]
  const flowData = flow.data
  const nodeData = flowData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0] : null

  const flowLink = flowData != null && nodeData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[0] : ''
  const nodeLink = flowData != null && nodeData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0] ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[1] : '' : ''

  const [defaultFlow, setDefaultFlow] = useState(flows.find((flow) => flow.name == flowLink.to) ? flows.find((flow) => flow.name == flowLink.to).name : '')
  const [defaultNode, setDefaultNode] = useState(nodeLink.to)

  useEffect(() => {
    setDefaultFlow(flows.find((flow) => flow.name == flowLink.to) ? flows.find((flow) => flow.name == flowLink.to).name : '')
    setDefaultNode(nodeLink.to)
  }, [flows, closePopUp])

  const flowOptions = flows.filter(({name}) => name != 'GLOBAL').map((flow) => {return {name: flow.name, id: flow.name}})

  const defNode = defaultFlow ? flows.filter((flow) => flow.name == defaultFlow)[0].data : null
  const defaultNodeOptions = defaultFlow && defNode ? flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => {return {id: node.data.id, name: node.data.node.display_name}}) : []
  const defaultConditionOptions = defNode && defaultFlow && defaultNode && flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.id == defaultNode)[0] ? flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.id == defaultNode)[0].data.node.conditions.map((condition) => condition.name) : []

  const [targetFlow, setTargetFlow] = useState<string>(defaultFlow)
  const [targetNode, setTargetNode] = useState<string>(defaultNode)

  useEffect(() => {
    setTargetFlow(defaultFlow)
    setTargetNode(defaultNode)
  }, [flows, closePopUp])

  const [nodeOptions, setNodeOptions] = useState(defaultNodeOptions)
  const [conditionOptions, setConditionOptions] = useState(defaultConditionOptions)




  useEffect(() => {
    
    setConditionOptions([])
    setTargetNode('')
    const flowData = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data : null
    setNodeOptions(flowData && targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => {{return {id: node.data.id, name: node.data.node.display_name}}}) : [])
  }, [targetFlow])

  useEffect(() => {
    
    const flowData = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data : null
    const nodesData = flowData && targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0] : null
    setConditionOptions(nodesData && targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0].data.node.conditions.map((condition) => condition.name) : [])
  }, [targetNode])


  return (
    <div className={classNames('px-4 py-2', className)}>
      <label htmlFor="">
        To flow <LinkComponent data={data} defaultValue={targetFlow} setTarget={setTargetFlow} index={0} linkType={links[0].linkType} options={flowOptions} type={links[0].type} />
      </label>
      <label htmlFor="">
        Node <LinkComponent data={data} defaultValue={targetNode} setTarget={setTargetNode} index={1} linkType={links[1].linkType} options={nodeOptions.length ? nodeOptions : defaultNodeOptions} type={links[1].type} />
      </label>
    </div>
  )
}
