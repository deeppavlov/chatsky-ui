import React from "react"

const MonitorIcon = ({ stroke="var(--foreground)", strokeOpacity="0.9", ...props }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width='22'
      height='22'
      viewBox='0 0 22 22'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M1 14V5C1 2.79086 2.79086 1 5 1H17C19.2091 1 21 2.79086 21 5V14M1 14C1 16.2091 2.79086 18 5 18H17C19.2091 18 21 16.2091 21 14M1 14H21M11 18V21M11 21H8M11 21H14M6 5H16M6 8H16M6 11H11'
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}

export default MonitorIcon
