import React from "react"

const SlotsConditionIcon = ({
  className,
  stroke = "var(--foreground)",
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18 5H17M8.5 5H8C7.44771 5 7 5.44772 7 6M23 13C23 13.5523 22.5523 14 22 14L21.5 14M23 10V9M23 6C23 5.44772 22.5523 5 22 5H21.5M13 5H12M12 14H6M12 14L11 13V15L12 14ZM18 14L17 14M16 19H2C1.44772 19 1 18.5523 1 18V10C1 9.44772 1.44772 9 2 9H16C16.5523 9 17 9.44772 17 10V18C17 18.5523 16.5523 19 16 19Z'
        stroke={stroke}
        strokeOpacity='0.7'
        strokeWidth='1.5'
        strokeLinecap='square'
      />
    </svg>
  )
}

export default SlotsConditionIcon
