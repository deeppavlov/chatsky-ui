import React from 'react'
import { SVGElementInterface } from '../../types/components'

const BuildedCheckIcon = ({ className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="60" height="61" viewBox="0 0 60 61" fill="none">
      <path d="M4 30.5135L21.6256 55.4991C22.4574 56.6782 24.226 56.6153 24.972 55.3801L56 4" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <path d="M4 30.5135L21.6256 55.4991C22.4574 56.6782 24.226 56.6153 24.972 55.3801L56 4" stroke="black" strokeOpacity="0.15" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

export default BuildedCheckIcon