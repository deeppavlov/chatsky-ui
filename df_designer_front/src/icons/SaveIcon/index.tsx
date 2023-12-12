import React from 'react'

export const SaveIcon = ({ className, stroke }: { className?: string; stroke: string }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M5 1H2C1.44772 1 1 1.44772 1 2V20C1 20.5523 1.44772 21 2 21H20C20.5523 21 21 20.5523 21 20V7.41421C21 7.149 20.8946 6.89464 20.7071 6.70711L15.2929 1.29289C15.1054 1.10536 14.851 1 14.5858 1H12M5 1V4C5 4.55228 5.44772 5 6 5H11C11.5523 5 12 4.55228 12 4V1M5 1H12M17 21V11C17 10.4477 16.5523 10 16 10H6C5.44772 10 5 10.4477 5 11V21M9 14H13M13 17H9" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
    </svg>
  )
}
