import classNames from 'classnames'
import React from 'react'

const Code = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames(
      "inline text-foreground text-xs bg-table-background rounded-md px-1 py-0.5 font-mono whitespace-nowrap",
      props.className
    )} {...props} >{children}</div>
  )
}

export default Code