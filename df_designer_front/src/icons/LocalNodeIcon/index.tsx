import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const LocalNodeIcon = ({ fill, className, strokeWidth, stroke }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 16.7167C18.5149 16.8572 19.0723 17.0582 19.4618 17.3333C21.8219 19 15.1122 20 12.0001 20C8.88792 20 2.17757 19 4.53831 17.3333C4.92795 17.0583 5.48542 16.8572 6.00037 16.7167M17.5964 9.33333C17.5964 12.4444 13.3992 17.3333 12.0001 17.3333C10.601 17.3333 6.40375 12.4444 6.40375 9.33333C6.40375 6.22222 8.73555 4 12.0001 4C15.2646 4 17.5964 6.22222 17.5964 9.33333ZM12.0001 7.55556C13.1303 7.55556 13.8655 8.27788 13.8655 9.33333C13.8655 10.3888 13.1303 11.1111 12.0001 11.1111C10.8698 11.1111 10.1346 10.4353 10.1346 9.33333C10.1346 8.23141 10.8698 7.55556 12.0001 7.55556Z" stroke={stroke} strokeOpacity="0.9" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
