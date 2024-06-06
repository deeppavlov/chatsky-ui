import React from "react"

const GridModeIcon = ({stroke='var(--foreground)'}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5 2V9M2 5H9M15 5H22M19 2V9M5 15V19M5 19V22M5 19H2M5 19H9M15 19H19M19 19H22M19 19V15M19 19V22'
        stroke={stroke}
        stroke-opacity='0.9'
        stroke-width='1.5'
        stroke-linecap='round'
      />
    </svg>
  )
}

export default GridModeIcon
