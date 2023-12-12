import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const EditLinkIcon = ({className, fill}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12" fill="none">
      <path d="M12.4932 10.5832H13.7515C16.2682 10.5832 18.3348 8.52484 18.3348 5.99984C18.3348 3.48317 16.2765 1.4165 13.7515 1.4165H12.4932M7.5013 1.4165H6.2513C3.7263 1.4165 1.66797 3.47484 1.66797 5.99984C1.66797 8.5165 3.7263 10.5832 6.2513 10.5832H7.5013M6.66797 5.99988H13.3346" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
