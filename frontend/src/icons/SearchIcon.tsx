import React from "react"

const SearchIcon = ({stroke = "var(--foreground)", className}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <circle
        cx='11'
        cy='11'
        r='7'
        stroke={stroke}
        strokeWidth='2'
      />
      <path
        d='M20.2929 21.7071C20.6834 22.0976 21.3166 22.0976 21.7071 21.7071C22.0976 21.3166 22.0976 20.6834 21.7071 20.2929L20.2929 21.7071ZM15.2929 16.7071L20.2929 21.7071L21.7071 20.2929L16.7071 15.2929L15.2929 16.7071Z'
        fill={stroke}
      />
    </svg>
  )
}

export default SearchIcon
