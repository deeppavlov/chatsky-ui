import classNames from 'classnames'
import React from 'react'

const Code = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        'inline whitespace-nowrap rounded-md bg-table-background px-1 py-0.5 font-mono text-xs text-foreground',
        props.className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Code
