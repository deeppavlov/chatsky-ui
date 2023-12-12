import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const LanguageIcon = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.5 21L6 5M13 3C12.0203 3 10.5606 3 9.09118 4.88087C9.0334 4.95483 9.01514 5.053 9.04093 5.14324L10.7881 11.2584C10.8633 11.5215 11.2351 11.5605 11.3946 11.3382C12.3542 10 13.6006 10 15 10C16.5429 10 16.9699 10 17.8952 9.10323C17.9617 9.0388 17.9933 8.94627 17.9818 8.85441L17.0761 1.60866C17.0451 1.36094 16.7406 1.25499 16.5536 1.42032C15.6011 2.26219 14.3743 3 13 3Z" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
