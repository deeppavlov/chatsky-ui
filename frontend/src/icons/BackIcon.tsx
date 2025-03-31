import React from 'react'

const BackIcon = ({
  className,
  stroke = 'var(--foreground)',
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 24 24'
      fill='none'
    >
      <path
        d='M18 11.5L7 11.5M7 11.5L11 8M7 11.5L11 15'
        stroke={stroke}
        stroke-width='1.5'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
    </svg>
  )
}

export default BackIcon
