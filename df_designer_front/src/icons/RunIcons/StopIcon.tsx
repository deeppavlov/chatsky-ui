import React from 'react'
import { SVGElementInterface } from '../../types/components'

const StopIcon = ({ className }:SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5.75" y="5.75" width="12.5" height="12.5" rx="1.25" stroke="hsl(var(--foreground))" stroke-opacity="0.9" stroke-width="1.5" />
    </svg>
  )
}

export default StopIcon