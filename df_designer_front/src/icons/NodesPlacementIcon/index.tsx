import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const NodesPlacementIcon = ({ className, fill }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 7C9 6.59375 9.3125 6.25 9.75 6.25H18.25C18.6562 6.25 19 6.59375 19 7C19 7.4375 18.6562 7.75 18.25 7.75H9.75C9.3125 7.75 9 7.4375 9 7ZM9 12C9 11.5938 9.3125 11.25 9.75 11.25H18.25C18.6562 11.25 19 11.5938 19 12C19 12.4375 18.6562 12.75 18.25 12.75H9.75C9.3125 12.75 9 12.4375 9 12ZM18.25 17.75H9.75C9.3125 17.75 9 17.4375 9 17C9 16.5938 9.3125 16.25 9.75 16.25H18.25C18.6562 16.25 19 16.5938 19 17C19 17.4375 18.6562 17.75 18.25 17.75Z" fill={fill} fillOpacity="0.9" />
      <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" fill={fill} fillOpacity="0.9" />
      <path d="M5 7C5 7.55229 5.44772 8 6 8C6.55228 8 7 7.55229 7 7C7 6.44771 6.55228 6 6 6C5.44772 6 5 6.44771 5 7Z" fill={fill} fillOpacity="0.9" />
      <path d="M5.00057 17C5.00057 17.5523 5.44828 18 6.00057 18C6.55285 18 7.00057 17.5523 7.00057 17C7.00057 16.4477 6.55285 16 6.00057 16C5.44828 16 5.00057 16.4477 5.00057 17Z" fill={fill} fillOpacity="0.9" />
    </svg>
  )
}
