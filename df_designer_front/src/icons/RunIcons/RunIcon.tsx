import React from 'react'
import { SVGElementInterface } from '../../types/components'

const RunIcon = ({ className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 5.7475C6 4.56075 7.31287 3.84399 8.31114 4.48573L18.0372 10.7382C18.9557 11.3287 18.9557 12.6713 18.0373 13.2618L8.31114 19.5143C7.31287 20.156 6 19.4393 6 18.2525V5.7475Z" stroke="hsl(var(--foreground))" stroke-opacity="0.9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export default RunIcon