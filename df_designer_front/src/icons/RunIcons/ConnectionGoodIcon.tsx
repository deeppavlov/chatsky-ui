import React from 'react'
import { SVGElementInterface } from '../../types/components'

const ConnectionGoodIcon = ({ className }:SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 4.99996L19.5489 6.54889L23 3.09778M5.52941 20C3.58017 20 2 18.4549 2 16.5489C2 14.6429 3.58017 13.0978 5.52941 13.0978C5.56866 13.0978 5.60776 13.0984 5.64669 13.0996C6.19098 10.4733 8.56526 8.4963 11.4118 8.4963C13.8732 8.4963 15.9816 9.97461 16.8589 12.0728C17.1861 11.9909 17.529 11.9474 17.8824 11.9474C20.1565 11.9474 22 13.75 22 15.9737C22 18.1974 20.1565 20 17.8824 20H5.52941Z" stroke="#3399CC" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  )
}

export default ConnectionGoodIcon