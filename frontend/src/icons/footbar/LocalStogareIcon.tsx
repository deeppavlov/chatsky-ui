import React from "react"

const LocalStogareIcon = ({ stroke='var(--foreground)' }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      width='23'
      height='23'
      viewBox='0 0 23 23'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15.1819 5.69663L14.1212 6.75729M15.5355 14.5355L21.1923 8.87861C21.5828 8.48808 21.5828 7.85492 21.1923 7.4644L15.5355 1.80754C15.1449 1.41702 14.5118 1.41702 14.1212 1.80754L8.4644 7.4644M15.5355 14.5355L15.5355 16.9497C15.5355 17.2149 15.4301 17.4692 15.2426 17.6568L11.9999 20.8994C11.2189 21.6805 9.95255 21.6805 9.1715 20.8994L2.10043 13.8284C1.31939 13.0473 1.31939 11.781 2.10043 10.9999L5.34307 7.75729C5.53061 7.56975 5.78497 7.4644 6.05018 7.4644L8.4644 7.4644M15.5355 14.5355L8.4644 7.4644M17.3032 7.81795L16.2426 8.87861M9.87861 17.3639L5.63597 13.1213'
        stroke={stroke}
        stroke-opacity='1'
        stroke-width='1.5'
        stroke-linecap='round'
      />
    </svg>
  )
}

export default LocalStogareIcon
