import React, { useContext } from 'react'
import { ReactNode } from 'react-markdown/lib/react-markdown'
import { useReactFlow } from 'reactflow'
import { typesContext } from '../../../../../../contexts/typesContext'
import * as TransitionIcons from '../../../../../../icons/TransitionIcons/index'

export type transitionComponentType = {
  handleConditionType: Function
  id: string
  children?: string
  icon?: ReactNode
  conditionType?: string
  forwardsMenu?: boolean
}

export const TransitionComponent = ({handleConditionType, id, children, icon, conditionType}) => {

  const { reactFlowInstance } = useContext(typesContext);
  const { setEdges } = useReactFlow()


  return (
    <div 
    className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" 
    onClick={() => { handleConditionType(conditionType); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>
      {children}
      {icon}
    </div>
  )
}
