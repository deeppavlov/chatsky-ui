import React from "react"

const DocumentationIcon = ({ className }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M13 4H13.3787C13.7765 4 14.158 4.15803 14.4393 4.43934L17.5607 7.56066C17.842 7.84196 18 8.2235 18 8.62132V9M13 4H7.5C6.67157 4 6 4.67157 6 5.5V18.5C6 19.3284 6.67157 20 7.5 20H16.5C17.3284 20 18 19.3284 18 18.5V9M13 4V7.5C13 8.32843 13.6716 9 14.5 9H18M9 12H14M9 15H14M9 9H10'
        stroke={'var(--foreground)'}
        strokeOpacity='0.7'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  )
}

export default DocumentationIcon
