import React from "react"

const PlayIcon = ({
  stroke = "var(--foreground)",
  strokeOpacity = "0.9",
  ...props
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width='15'
      height='18'
      viewBox='0 0 15 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M1 2.7475C1 1.56075 2.31287 0.843987 3.31114 1.48573L13.0372 7.73823C13.9557 8.32869 13.9557 9.67131 13.0373 10.2618L3.31114 16.5143C2.31287 17.156 1 16.4393 1 15.2525V2.7475Z'
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default PlayIcon
