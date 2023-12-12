import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const WorkSpaceModeIcon = ({ className, fill }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 1V8M1 4H8M14 4H21M18 1V8M4 14V18M4 18V21M4 18H1M4 18H8M14 18H18M18 18H21M18 18V14M18 18V21" stroke={fill} strokeWidth="1.5" strokeOpacity={0.7} strokeLinecap="round" />
    </svg>
  )
}
