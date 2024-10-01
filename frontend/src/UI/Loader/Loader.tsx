import classNames from "classnames"
import React from "react"
import "./loader.css"

const Loader = ({ className }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={classNames("w-5 h-5 inline-block border border-foreground !border-b-transparent rounded-full loader-rotation", className)}></span>
}

export default Loader
