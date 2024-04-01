import React from "react"

const GlobalNodeIcon = ({ stroke='#7000FF', fill='#7000FF', ...props }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12 22C14.6837 22 17.1205 20.9428 18.9166 19.2222M12 22C9.3163 22 6.87951 20.9428 5.08337 19.2222M12 22L12 2M2 12C2 14.8391 3.18318 17.4019 5.08337 19.2222M2 12C2 9.16085 3.18318 6.59805 5.08337 4.77778M2 12L22 12M12 2C14.6837 2 17.1205 3.05717 18.9166 4.77778M12 2C9.3163 2 6.87951 3.05717 5.08337 4.77778M22 12C22 14.8391 20.8168 17.4019 18.9166 19.2222M22 12C22 9.16085 20.8168 6.59805 18.9166 4.77778M18.9166 19.2222C17.1205 17.5016 14.6837 16.4444 12 16.4444C9.3163 16.4444 6.87951 17.5016 5.08337 19.2222M18.9166 4.77778C17.1205 6.49839 14.6837 7.55556 12 7.55556C9.3163 7.55556 6.87951 6.49839 5.08337 4.77778'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M12 2C12 2 6.5 3 6.5 12C6.5 21 12 22 12 22'
        stroke={stroke}
        strokeWidth='1.5'
      />
      <path
        d='M12 2C12 2 17.5 3 17.5 12C17.5 21 12 22 12 22'
        stroke={stroke}
        strokeWidth='1.5'
      />
    </svg>
  )
}

export default GlobalNodeIcon
