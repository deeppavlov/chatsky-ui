import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const ConditionPlusIcon = ({ fill, className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 6.00024L12 18.0002M6 11.9996L18 11.9996" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
