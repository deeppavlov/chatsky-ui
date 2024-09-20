import React from "react"

const TrashIcon = ({ className, stroke="var(--foreground)" }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M20 7.53899C17.0441 7.24068 14.061 7.09153 11.0915 7.09153C9.32881 7.09153 7.5661 7.18644 5.81695 7.36271L4 7.53899M8.89453 6.64407L9.08436 5.47796C9.21995 4.63728 9.32842 4 10.8335 4H13.1657C14.6708 4 14.7793 4.6644 14.9149 5.47796L15.1047 6.63051M18.0882 7.64746L17.5051 16.5966C17.4102 17.9932 17.3289 19.078 14.8475 19.078H9.13902C6.65766 19.078 6.5763 17.9932 6.48138 16.5966L5.89834 7.64746'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default TrashIcon
