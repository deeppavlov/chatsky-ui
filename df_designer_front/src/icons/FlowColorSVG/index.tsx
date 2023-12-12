import React from 'react'

export const FlowColorSVG = ({ fill }: { fill: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="8" height="8" rx="4" fill={fill} />
      <path d="M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12ZM6.44831 12C6.44831 15.0661 8.93389 17.5517 12 17.5517C15.0661 17.5517 17.5517 15.0661 17.5517 12C17.5517 8.93389 15.0661 6.44831 12 6.44831C8.93389 6.44831 6.44831 8.93389 6.44831 12Z" fill={fill} />
    </svg>
  )
}
