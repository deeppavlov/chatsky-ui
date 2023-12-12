import React from 'react'

export const DeleteIcon = ({className, fill}: {className?: string; fill?: string;}) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
      <path d="M17 4.53899C14.0441 4.24068 11.061 4.09153 8.09153 4.09153C6.32881 4.09153 4.5661 4.18644 2.81695 4.36271L1 4.53899M5.89453 3.64407L6.08436 2.47796C6.21995 1.63728 6.32842 1 7.83351 1H10.1657C11.6708 1 11.7793 1.6644 11.9149 2.47796L12.1047 3.63051M15.0882 4.64746L14.5051 13.5966C14.4102 14.9932 14.3289 16.078 11.8475 16.078H6.13902C3.65766 16.078 3.5763 14.9932 3.48138 13.5966L2.89834 4.64746" stroke={fill} strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
