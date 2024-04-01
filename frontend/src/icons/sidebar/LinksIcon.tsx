import React from "react"

const LinksIcon = ({ className, fill='var(--foreground)'}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      className={className}
      fill={fill}
      stroke={fill}>
      <path
        fillOpacity='0'
        d='M14.4932 16.5833H15.7515C18.2682 16.5833 20.3348 14.525 20.3348 12C20.3348 9.48329 18.2765 7.41663 15.7515 7.41663H14.4932M9.5013 7.41663H8.2513C5.7263 7.41663 3.66797 9.47496 3.66797 12C3.66797 14.5166 5.7263 16.5833 8.2513 16.5833H9.5013M8.66797 12H15.3346'
        strokeOpacity='0.9'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default LinksIcon
