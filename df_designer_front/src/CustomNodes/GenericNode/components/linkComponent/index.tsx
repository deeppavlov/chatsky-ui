import React, { useContext, useEffect, useState } from 'react'
import Dropdown from '../../../../components/dropdownComponent'
import { TabsContext } from '../../../../contexts/tabsContext'
import { NodeDataType, NodeType } from '../../../../types/flow'

type LinkComponentType = {
  defaultValue: string
  options: any[]
  type: string
  linkType: string
  data: NodeDataType
  index: number
  setTarget: Function
}

export const LinkComponent = ({ options, type, linkType, setTarget, defaultValue, data, index }: LinkComponentType) => {

  const [option, setOption] = useState<string>(defaultValue)
  const { flows, tabId } = useContext(TabsContext)
  const flowData = flows.filter((flow) => flow.id == tabId)[0].data

  const link = flowData != null ?
    flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0]
      ?
      flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[index]
      :
      ''
      : ''

      // console.log(options)


  return (
    <div className='mb-3'>
      <select className='bg-background border-[1px] border-foreground w-full h-10 rounded-lg px-4 py-1' value={option} onChange={(e) => {setOption(e.target.value); setTarget(e.target.value); link.to = e.target.value;}}>
        <option value="">Choose option...</option>
        {options.map((option) => {
          return (
            <option key={option.id} value={option.id}> {option.name} </option>
          )
        })}
      </select>
    </div>
  )
}
