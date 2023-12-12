import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const FileUpIcon = ({ fill }: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M16.7738 8.9C20.3738 9.21 21.8438 11.06 21.8438 15.11V15.24C21.8438 19.71 20.0538 21.5 15.5838 21.5H9.0738C4.6038 21.5 2.8138 19.71 2.8138 15.24V15.11C2.8138 11.09 4.2638 9.24 7.8038 8.91M12.3338 2V14.88M15.6838 12.65L12.3338 16L8.9838 12.65" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
