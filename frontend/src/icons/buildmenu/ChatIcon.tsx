import React from "react"

const ChatIcon = ({
  fill = "var(--foreground)",
  fillOpacity = "0.9",
  ...props
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      width='22'
      height='20'
      viewBox='0 0 22 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M0.25 10C0.25 4.61522 4.61522 0.25 10 0.25H12C17.3848 0.25 21.75 4.61522 21.75 10C21.75 15.3848 17.3848 19.75 12 19.75H5C2.37665 19.75 0.25 17.6234 0.25 15V10ZM10 1.75C5.44365 1.75 1.75 5.44365 1.75 10V15C1.75 16.7949 3.20507 18.25 5 18.25H12C16.5564 18.25 20.25 14.5563 20.25 10C20.25 5.44365 16.5564 1.75 12 1.75H10Z'
        fill={fill}
        fillOpacity={fillOpacity}
      />
      <path
        d='M12 10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10C10 9.44772 10.4477 9 11 9C11.5523 9 12 9.44772 12 10Z'
        fill={fill}
        fillOpacity={fillOpacity}
      />
      <path
        d='M16 10C16 10.5523 15.5523 11 15 11C14.4477 11 14 10.5523 14 10C14 9.44772 14.4477 9 15 9C15.5523 9 16 9.44772 16 10Z'
        fill={fill}
        fillOpacity={fillOpacity}
      />
      <path
        d='M8 10C8 10.5523 7.55228 11 7 11C6.44772 11 6 10.5523 6 10C6 9.44772 6.44772 9 7 9C7.55228 9 8 9.44772 8 10Z'
        fill={fill}
        fillOpacity={fillOpacity}
      />
    </svg>
  )
}

export default ChatIcon
