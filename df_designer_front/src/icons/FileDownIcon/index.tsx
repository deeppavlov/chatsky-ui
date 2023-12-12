import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const FileDownIcon = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16.4006 9.46018C20.0006 9.77018 21.4706 11.6202 21.4706 15.6702L21.4706 15.8002C21.4706 20.2702 19.6806 22.0602 15.2106 22.0602L8.69059 22.0602C4.22059 22.0602 2.43059 20.2702 2.43059 15.8002L2.43059 15.6702C2.43059 11.6502 3.88059 9.80018 7.42059 9.47018M11.9406 15.9602L11.9406 3.08018M8.59058 5.30979L11.9406 1.95979L15.2906 5.30979" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
