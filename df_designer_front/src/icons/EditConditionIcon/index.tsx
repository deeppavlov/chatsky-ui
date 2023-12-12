import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const EditConditionIcon = ({className, fill}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15.3779 10.0547L16.3457 8.98101C17.3712 7.84678 17.8334 6.55377 16.2373 4.97341C14.6412 3.40062 13.4351 3.95261 12.4095 5.08684L6.4801 11.6578C6.25621 11.9073 6.03954 12.3988 5.99621 12.7391L5.72898 15.189C5.6351 16.0737 6.24176 16.6786 7.07954 16.5274L9.4051 16.1115C9.7301 16.051 10.1851 15.8015 10.409 15.5444L13.2618 12.3837M11.4196 6.1833C11.7302 8.27027 13.3479 9.86575 15.3557 10.0775M5 19H12.9444M15.8333 19H18" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
