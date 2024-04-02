import React from "react"

const NodesIcon = ({ className, fill='var(--foreground)' }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='20'
      viewBox='0 0 24 20'
      className={className}
      fill={fill}>
      <path
        strokeWidth='0'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M21.5303 0.21967C21.2374 -0.0732233 20.7626 -0.0732233 20.4697 0.21967C20.1768 0.512563 20.1768 0.987437 20.4697 1.28033L21.1893 2H19C17.4812 2 16.25 3.23122 16.25 4.75V7.75C16.25 8.44036 15.6904 9 15 9H12V6.75C12 5.64543 11.1046 4.75 10 4.75H2C0.895431 4.75 0 5.64543 0 6.75V15.75C0 16.8546 0.895431 17.75 2 17.75H10C11.1046 17.75 12 15.8546 12 14.75V14.5H15.5C15.9142 14.5 16.25 14.8358 16.25 15.25C16.25 16.4926 17.2574 17.5 18.5 17.5H21.1893L20.4697 18.2197C20.1768 18.5126 20.1768 18.9874 20.4697 19.2803C20.7626 19.5732 21.2374 19.5732 21.5303 19.2803L24 16.75L21.5303 14.2197C21.2374 13.9268 20.7626 13.9268 20.4697 14.2197C20.1768 14.5126 20.1768 14.9874 20.4697 15.2803L21.1893 16H18.5C18.0858 16 17.75 15.6642 17.75 15.25C17.75 14.0074 16.7426 13 15.5 13H12V10.5H15C16.5188 10.5 17.75 9.26878 17.75 7.75V4.75C17.75 4.05964 18.3096 3.5 19 3.5H21.1893L20.4697 4.21967C20.1768 4.51256 20.1768 4.98744 20.4697 5.28033C20.7626 5.57322 21.2374 5.57322 21.5303 5.28033L24 2.75L21.5303 0.21967ZM2 6.25H10C10.2761 6.25 10.5 6.47386 10.5 6.75V15.75C10.5 16.0261 10.2761 16.25 10 16.25H2C1.72386 16.25 1.5 16.0261 1.5 15.75V6.75C1.5 6.47386 1.72386 6.25 2 6.25Z'
        fillOpacity='0.7'
      />
    </svg>
  )
}

export default NodesIcon