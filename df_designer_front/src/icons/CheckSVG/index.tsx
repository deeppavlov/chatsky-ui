import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const CheckSVG = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L8.52642 15.8211C9.35374 16.483 10.5536 16.3848 11.2624 15.5973L19 7" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
