import React from 'react'

const CheckIcon = ({ className }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='9'
      height='10'
      viewBox='0 0 9 10'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M8.1268 0.596065C8.54992 0.819573 8.72067 1.36172 8.50835 1.80699L5.23475 8.67094C4.73532 9.7181 3.34029 9.78826 2.74823 8.79598L0.731005 5.41457C0.479201 4.99264 0.600151 4.43582 1.00108 4.17089C1.40188 3.90595 1.93102 4.03322 2.18268 4.45515L3.93025 7.38441L6.97632 0.997609C7.18864 0.552339 7.70383 0.372558 8.1268 0.596065Z' />
    </svg>
  )
}

export default CheckIcon
