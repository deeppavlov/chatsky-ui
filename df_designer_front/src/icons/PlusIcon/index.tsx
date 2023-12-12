import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const PlusIcon = ({fill, className}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.00024L7 13.0002M1 6.9996L13 6.9996" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
