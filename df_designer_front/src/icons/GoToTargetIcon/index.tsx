import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const GoToTargetIcon = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 1V5.90909M14.0909 10H19M10 14.0909V19M5.90909 10H1M16.5455 10C16.5455 13.615 13.615 16.5455 10 16.5455C6.38505 16.5455 3.45455 13.615 3.45455 10C3.45455 6.38505 6.38505 3.45455 10 3.45455C13.615 3.45455 16.5455 6.38505 16.5455 10Z" stroke={fill} stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}
