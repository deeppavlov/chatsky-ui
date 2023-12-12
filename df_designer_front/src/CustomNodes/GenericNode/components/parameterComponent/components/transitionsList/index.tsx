import React from 'react'
import { nodeTransitionTypes } from '../../../../../../utils'
import { TransitionComponent, transitionComponentType } from '../transitionComponent'
import * as TransitionIcons from '../../../../../../icons/TransitionIcons/index'

type TransitionListType = {
  id: string
  handleConditionType: Function
  forwardsMenu: boolean
}


export const TransitionList = ({ id, handleConditionType, forwardsMenu }: TransitionListType) => {
  return (
    <div className={(forwardsMenu ? 'opacity-100 scale-100 transition-all origin-left' : 'opacity-0 scale-0 transition-all origin-left') + ' ' + 'absolute z-20 bg-node-back px-2 py-1 w-max h-max rounded-lg left-96 -bottom-20 ml-0'}>
      <span className="text-sm text-neutral-400" >Choose transition</span>
      <TransitionComponent 
      icon={''}
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.manual}
      >
        manual
      </TransitionComponent>
      <TransitionComponent
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.forward}
      icon={<TransitionIcons.forward className='ml-2' />}>
        forward
      </TransitionComponent>
      <TransitionComponent 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.backward} 
      icon={<TransitionIcons.backward className='ml-2' />}>
        backward
      </TransitionComponent>
      <TransitionComponent 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.repeat} 
      icon={<TransitionIcons.repeat className='ml-2' />}>
        repeat
      </TransitionComponent>
      <TransitionComponent 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.previous} 
      icon={<TransitionIcons.previous className='ml-2' />}>
        previous
      </TransitionComponent>
      <TransitionComponent 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.to_start} 
      icon={<TransitionIcons.to_start className='ml-2' />}>
        to start
      </TransitionComponent>
      <TransitionComponent 
      id={id}
      handleConditionType={handleConditionType} 
      conditionType={nodeTransitionTypes.to_fallback} 
      icon={<TransitionIcons.to_fallback className='ml-2' />}>
        to fallback
      </TransitionComponent>
    </div>
  )
}
