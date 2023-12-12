import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const AccessTokensIcon = ({fill}: SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <g clip-path="url(#clip0_1436_4054)">
        <path d="M15.9383 14.095C13.8955 16.169 9.58998 15.1602 6.32157 11.8418C3.05316 8.52337 2.05957 4.15196 4.10233 2.07796M15.9383 14.095C17.981 12.021 16.9875 7.64955 13.719 4.33115C10.4506 1.01274 6.14508 0.00395613 4.10233 2.07796M15.9383 14.095L13.0319 16.3794C10.9395 17.4416 7.37074 17.4134 4.10233 14.095C0.83392 10.7766 0.477941 6.81995 1.5241 4.69562L4.10233 2.07796M12.5088 7.35103C13.5549 8.41319 14.078 9.47535 14.078 11.0686" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_1436_4054">
          <rect width="18" height="18" fill={fill} />
        </clipPath>
      </defs>
    </svg>
  )
}
