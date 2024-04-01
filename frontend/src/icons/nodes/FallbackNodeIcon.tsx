import React from "react"

const FallbackNodeIcon = ({ fill='#FF3366', stroke='#FF3366', ...props }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15.8198 18.9091C18.8033 18.11 21.0009 15.3523 21.0009 12.0712C21.0009 8.16791 17.9131 5 14.0463 5C9.40766 5 7.0918 8.9316 7.0918 8.9316M7.0918 8.9316V5.70712M7.0918 8.9316H8.48966H10.1796'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12 18.9091L3 18.9091'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeDasharray='2 2'
      />
    </svg>
  )
}

export default FallbackNodeIcon
