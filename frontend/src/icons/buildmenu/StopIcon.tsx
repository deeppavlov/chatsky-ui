import React from "react"

const StopIcon = ({
  fill,
  stroke = "var(--foreground)",
  strokeOpacity = "0.9",
  ...props
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <rect
        x='0.75'
        y='0.75'
        width='12.5'
        height='12.5'
        rx='1.25'
        stroke={stroke}
        stroke-opacity={strokeOpacity}
        stroke-width='1.5'
      />
    </svg>
  )
}

export default StopIcon
