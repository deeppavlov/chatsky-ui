import React from "react"

export const BotIcon = ({
  className,
  fill = "var(--foreground)",
}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'>
      <path
        d='M12.25 18.75C13.0784 18.75 13.75 18.0784 13.75 17.25C13.75 16.4216 13.0784 15.75 12.25 15.75C11.4216 15.75 10.75 16.4216 10.75 17.25C10.75 18.0784 11.4216 18.75 12.25 18.75Z'
        fill={fill}
      />
      <path
        d='M19.25 18.75C20.0784 18.75 20.75 18.0784 20.75 17.25C20.75 16.4216 20.0784 15.75 19.25 15.75C18.4216 15.75 17.75 16.4216 17.75 17.25C17.75 18.0784 18.4216 18.75 19.25 18.75Z'
        fill={fill}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.75 4C15.4633 4 15.05 4.07984 14.6868 4.34135C14.2853 4.6304 14 5.10556 14 5.75C14 6.39444 14.2853 6.8696 14.6868 7.15865C14.7885 7.23193 14.8942 7.29094 15 7.33793V9H9.75C7.67893 9 6 10.6789 6 12.75V20.75C6 22.8211 7.67893 24.5 9.75 24.5H21.75C23.8211 24.5 25.5 22.8211 25.5 20.75V12.75C25.5 10.6789 23.8211 9 21.75 9H16.5V7.33793C16.6058 7.29094 16.7115 7.23193 16.8132 7.15865C17.2147 6.8696 17.5 6.39444 17.5 5.75C17.5 5.10556 17.2147 4.6304 16.8132 4.34135C16.45 4.07984 16.0367 4 15.75 4ZM7.5 12.75C7.5 11.5074 8.50736 10.5 9.75 10.5H10V10.75C10 12.2688 11.2312 13.5 12.75 13.5H18.75C20.2688 13.5 21.5 12.2688 21.5 10.75V10.5H21.75C22.9926 10.5 24 11.5074 24 12.75V20.75C24 21.9926 22.9926 23 21.75 23H9.75C8.50736 23 7.5 21.9926 7.5 20.75V12.75ZM11.5 10.75V10.5H20V10.75C20 11.4404 19.4404 12 18.75 12H12.75C12.0596 12 11.5 11.4404 11.5 10.75Z'
        fill={fill}
      />
      <path
        d='M5.5 14.75C5.5 14.3358 5.16421 14 4.75 14C4.33579 14 4 14.3358 4 14.75V18.75C4 19.1642 4.33579 19.5 4.75 19.5C5.16421 19.5 5.5 19.1642 5.5 18.75V14.75Z'
        fill={fill}
      />
      <path
        d='M27.5 14.75C27.5 14.3358 27.1642 14 26.75 14C26.3358 14 26 14.3358 26 14.75V18.75C26 19.1642 26.3358 19.5 26.75 19.5C27.1642 19.5 27.5 19.1642 27.5 18.75V14.75Z'
        fill={fill}
      />
    </svg>
  )
}
