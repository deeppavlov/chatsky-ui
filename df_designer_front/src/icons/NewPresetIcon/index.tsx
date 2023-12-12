import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const NewPresetIcon = ({ className, fill='black' }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M17.5 3.5L20.5 3.5M20.5 3.5L20.5 6.5M20.5 3.5L20.5 0.500002M20.5 3.5L23.5 3.5M6.73073 6.6875L9.96145 6.6875C9.96145 6.6875 8.88454 3.5 12.1153 3.5C15.346 3.5 14.2691 6.6875 14.2691 6.6875L17.5 6.6875L17.4998 9.875C17.4998 9.875 14.2691 8.8125 14.2691 12C14.2691 15.1875 17.4998 14.125 17.4998 14.125L17.4998 17.3125L14.2691 17.3125C14.2691 17.3125 15.346 20.5 12.1153 20.5C8.88454 20.5 9.96145 17.3125 9.96145 17.3125L6.73073 17.3125L6.73073 14.125C6.73073 14.125 3.5 15.1875 3.5 12C3.5 8.8125 6.73073 9.875 6.73073 9.875L6.73073 6.6875Z" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" />
    </svg>
  )
}
