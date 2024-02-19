import React from 'react'
import { SVGElementInterface } from '../../types/components'

const NewLogsIcon = ({ className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M2 15V6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V15M2 15C2 17.2091 3.79086 19 6 19H18C20.2091 19 22 17.2091 22 15M2 15H22M12 19V22M12 22H9M12 22H15M7 6H17M7 9H17M7 12H12" stroke="hsl(var(--foreground))" stroke-opacity="0.9" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  )
}

export default NewLogsIcon