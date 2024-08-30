import React from "react"

const ButtonConditionIcon = ({className, stroke="var(--foreground)"}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='25'
      viewBox='0 0 24 25'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M17 7.71429V4.28571C17 3.6795 16.7592 3.09812 16.3305 2.66947C15.9019 2.24081 15.3205 2 14.7143 2H3.28571C2.6795 2 2.09812 2.24081 1.66947 2.66947C1.24082 3.09812 1 3.6795 1 4.28571V12.7143C1 13.3205 1.24082 13.9019 1.66947 14.3305C2.09812 14.7592 2.6795 15 3.28571 15H4.5M8 8.51281V6.51281C8 5.51281 7.20825 5.01281 6.5 5.01281C5.79175 5.01281 5 5.51281 5 6.51281V8.51281M8 8.51281V10.5128M8 8.51281H5M5 10.5128V8.51281M20 13.1282C20 12.6154 20.4471 11.5897 21.5 11.5897C22.5529 11.5897 23 12.5137 23 13.641V14.7692C23 18.359 23 24 17 24H14.5C13 24 12.2078 22.9743 11.7061 22.4615C11.2045 21.9487 8.20894 16.8205 7.70614 16.3077C7.32822 15.9222 6.95442 15.2471 7.00453 14.5C7.02109 14.2531 7.08395 13.9983 7.20825 13.7436C7.70007 12.7356 8.67684 12.9462 9.4591 13.4721C9.48642 13.4905 9.51152 13.5119 9.53438 13.5356L10.1845 14.2088C10.2091 14.2343 10.236 14.2579 10.2672 14.2745C10.5931 14.448 11 14.2137 11 13.8318V7.58973C11 6.72387 11.7712 6.05127 12.5 6.05127C13.2288 6.05127 14 6.23376 14 7.65954M20 13.1282V13.7179M20 13.1282V12.5651L20 12.5619C19.9885 11.3005 19.7054 10.5128 18.5 10.5128C17.2939 10.5128 17 11.6768 17 12.5641M17 12.5641V12.7179M17 12.5641V11.5428L17.0001 11.534C17.0154 10.5775 16.4984 9.99999 15.5 9.99999C14.8856 9.99999 14 10.5128 14 11.5384V7.65954M14 7.65954V12.7179'
        stroke={stroke}
        stroke-opacity='0.7'
        stroke-width='1.5'
        stroke-linecap='round'
      />
    </svg>
  )
}

export default ButtonConditionIcon
