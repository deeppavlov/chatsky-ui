import React, { useContext } from 'react'
import { nodeTransitionTypes } from '../../../../../../utils'
import { TransitionComponent, transitionComponentType } from '../transitionComponent'
import * as TransitionIcons from '../../../../../../icons/TransitionIcons/index'
import { darkContext } from '../../../../../../contexts/darkContext'

type TransitionListType = {
  id: string
  nodeId: string
  handleConditionType: Function
  forwardsMenu: boolean
}


export const TransitionList = ({ id, handleConditionType, forwardsMenu, nodeId }: TransitionListType) => {

  const {dark} = useContext(darkContext)

  return (
    <div className={(forwardsMenu ? 'opacity-100 scale-100 transition-all origin-left' : 'opacity-0 scale-0 transition-all origin-left') + ' ' + 'absolute z-20 bg-muted px-2 py-1 w-max h-max rounded-lg left-96 -bottom-20 ml-0'}>
      <span className="text-sm text-foreground" >Choose transition</span>
      <TransitionComponent
      nodeId={nodeId} 
      icon={''}
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.manual}
      >
        manual
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId}
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.forward}
      icon={<TransitionIcons.forward fill={dark ? "white" : "black"} className='ml-2' />}>
        forward
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId} 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.backward} 
      icon={<TransitionIcons.backward fill={dark ? "white" : "black"} className='ml-2' />}>
        backward
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId} 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.repeat} 
      icon={<TransitionIcons.repeat fill={dark ? "white" : "black"} className='ml-2' />}>
        repeat
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId} 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.previous} 
      icon={<TransitionIcons.previous fill={dark ? "white" : "black"} className='ml-2' />}>
        previous
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId} 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.to_start} 
      icon={<TransitionIcons.to_start fill={dark ? "white" : "black"} className='ml-2' />}>
        to start
      </TransitionComponent>
      <TransitionComponent
      nodeId={nodeId} 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.to_fallback} 
      icon={<TransitionIcons.to_fallback fill={dark ? "white" : "black"} className='ml-2' />}>
        to fallback
      </TransitionComponent>
    </div>
  )
}
