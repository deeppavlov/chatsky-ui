import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const MyStorageIcon = ({className, fill='black'}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M15.6818 6.69663L14.6212 7.75729M16.0354 15.5355L21.6922 9.87861C22.0828 9.48808 22.0828 8.85492 21.6922 8.4644L16.0354 2.80754C15.6449 2.41702 15.0117 2.41702 14.6212 2.80754L8.96432 8.4644M16.0354 15.5355L16.0354 17.9497C16.0354 18.2149 15.93 18.4692 15.7425 18.6568L12.4999 21.8994C11.7188 22.6805 10.4525 22.6805 9.67143 21.8994L2.60036 14.8284C1.81931 14.0473 1.81931 12.781 2.60036 11.9999L5.843 8.75729C6.03054 8.56975 6.28489 8.4644 6.55011 8.4644L8.96432 8.4644M16.0354 15.5355L8.96432 8.4644M17.8032 8.81795L16.7425 9.87861M10.3785 18.3639L6.13589 14.1213" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
