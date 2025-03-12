import classNames from 'classnames'
import React from 'react'
import './loader.css'

const Loader = ({ className }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={classNames(
        'loader-rotation inline-block h-5 w-5 rounded-full border border-foreground !border-b-transparent',
        className,
      )}
    ></span>
  )
}

export default Loader
