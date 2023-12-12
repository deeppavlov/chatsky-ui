import React from 'react'

export const HelpBtn = ({className}: {className?: string}) => {
  return (
    <button className={`w-10 h-10 mt-3 bg-background rounded-full` + ' ' + className}>
      ?
    </button>
  )
}
