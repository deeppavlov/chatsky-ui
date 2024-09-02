import React from "react"

export const PlusFlagIcon = ({
  fill = "#00CC99",
  stroke = "#00CC99",
  className,
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
        d='M10.708 5.83427C9.21009 4.88107 7.25 5.95706 7.25 7.73251V16.2675C7.25 18.0429 9.21009 19.1189 10.708 18.1657L17.414 13.8982C18.8034 13.0141 18.8034 10.9859 17.414 10.1018L10.708 5.83427Z'
        fill={fill}
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
