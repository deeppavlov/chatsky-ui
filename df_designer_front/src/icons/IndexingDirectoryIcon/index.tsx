import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const IndexingDirectoryIcon = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 7L10.2929 5.29289C10.1054 5.10536 9.851 5 9.58579 5H4C3.44772 5 3 5.44772 3 6V18C3 18.5523 3.44772 19 4 19H7M12 7H20C20.5523 7 21 7.44772 21 8V18C21 18.5523 20.5523 19 20 19H17M12 7L10.2929 8.70711C10.1054 8.89464 9.851 9 9.58579 9H6M7 19V14C7 13.4477 7.44772 13 8 13H16C16.5523 13 17 13.4477 17 14V16V19M7 19H17M10 16H14" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
