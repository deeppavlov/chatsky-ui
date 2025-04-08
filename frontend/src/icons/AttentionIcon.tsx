import React from 'react';

const AttentionIcon = ({
  stroke = 'var(--foreground)',
  strokeOpacity = '0.9',
  ...props
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      width='24'
      height='40'
      viewBox='0 0 24 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g id='icons 24*24'>
        <path
          id='Vector'
          d='M12 14.2V11M12 7.8H12.008M20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11Z'
          stroke={stroke}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}

export default AttentionIcon
