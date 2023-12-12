import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const PersonIcon = ({className, fill}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 22C4 18.5817 5 15 12 15C19 15 20 18.5817 20 22M17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z" stroke={fill} strokeWidth="1.5" />
    </svg>
  )
}
