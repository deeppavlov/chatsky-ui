import React from "react"

const CustomConditionIcon = ({ className, fill, stroke="var(--foreground)" }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15 6H15.75C17.4069 6 18.75 7.34315 18.75 9V16.5C18.75 18.1569 17.4069 19.5 15.75 19.5H8.25C6.59315 19.5 5.25 18.1569 5.25 16.5V9C5.25 7.34315 6.59315 6 8.25 6H9M15 6C15 6.82843 14.3284 7.5 13.5 7.5H10.5C9.67157 7.5 9 6.82843 9 6M15 6C15 5.17157 14.3284 4.5 13.5 4.5H10.5C9.67157 4.5 9 5.17157 9 6M9 10.5H15M9 13.5H15M9 16.5H12'
        stroke={stroke}
        stroke-opacity='0.7'
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
    </svg>
  )
}

export default CustomConditionIcon
