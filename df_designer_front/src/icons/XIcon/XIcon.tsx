import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const XIcon = ({className, fill, height, width, viewbox}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M0.756918 0.757324L9.2422 9.24261M0.756012 9.24261L9.24129 0.757324" stroke='black' strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
