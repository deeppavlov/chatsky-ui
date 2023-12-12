import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const CursorIcon = ({ className, fill }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M4.15624 19.0178L0.755084 1.05872C0.736537 0.960785 0.771443 0.873274 0.866246 0.808439C0.963392 0.742002 1.09141 0.726027 1.21593 0.793615L17.099 9.41488C17.1741 9.45564 17.209 9.50187 17.2271 9.53963C17.247 9.58125 17.2549 9.63128 17.247 9.68337C17.2392 9.73547 17.2166 9.7824 17.1838 9.81823C17.1537 9.85102 17.1045 9.88634 17.019 9.90428L9.90423 11.3965C9.40876 11.5004 8.97361 11.8056 8.71674 12.2481L4.73526 19.1054C4.67278 19.2131 4.5574 19.2692 4.40957 19.2448C4.26219 19.2204 4.17799 19.1327 4.15624 19.0178Z" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
