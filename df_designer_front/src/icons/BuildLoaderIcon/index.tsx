import React from 'react'
import { SVGElementInterface } from '../../types/components'

const BuildLoaderIcon = ({ className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path d="M56 30C56 15.6406 44.3594 4 30 4C15.6406 4 4 15.6406 4 30C4 44.3594 15.6406 56 30 56" stroke="#3399CC" stroke-width="8" stroke-linecap="round" />
    </svg>
  )
}

export default BuildLoaderIcon