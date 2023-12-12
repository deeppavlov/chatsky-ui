import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const ChatIcon = ({className, height, viewbox, width, fill, pathClassName}: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">
      <path className={pathClassName} fillRule="evenodd" clipRule="evenodd" d="M0.0300293 7.5C0.0300293 3.63401 3.27857 0.5 7.28584 0.5H8.77422C12.7815 0.5 16.03 3.63401 16.03 7.5C16.03 11.366 12.7815 14.5 8.77422 14.5H3.56491C1.61265 14.5 0.0300293 12.9732 0.0300293 11.0897V7.5ZM7.28584 1.57692C3.89507 1.57692 1.14631 4.22878 1.14631 7.5V11.0897C1.14631 12.3784 2.22915 13.4231 3.56491 13.4231H8.77422C12.165 13.4231 14.9137 10.7712 14.9137 7.5C14.9137 4.22878 12.165 1.57692 8.77422 1.57692H7.28584Z" fill={fill} fillOpacity="0.9" />
      <path className={pathClassName} d="M8.77422 7.5C8.77422 7.89651 8.44103 8.21795 8.03003 8.21795C7.61903 8.21795 7.28584 7.89651 7.28584 7.5C7.28584 7.10349 7.61903 6.78205 8.03003 6.78205C8.44103 6.78205 8.77422 7.10349 8.77422 7.5Z" fill={fill} fillOpacity="0.9" />
      <path className={pathClassName} d="M11.751 7.5C11.751 7.89651 11.4178 8.21795 11.0068 8.21795C10.5958 8.21795 10.2626 7.89651 10.2626 7.5C10.2626 7.10349 10.5958 6.78205 11.0068 6.78205C11.4178 6.78205 11.751 7.10349 11.751 7.5Z" fill={fill} fillOpacity="0.9" />
      <path className={pathClassName} d="M5.79747 7.5C5.79747 7.89651 5.46429 8.21795 5.05329 8.21795C4.64228 8.21795 4.3091 7.89651 4.3091 7.5C4.3091 7.10349 4.64228 6.78205 5.05329 6.78205C5.46429 6.78205 5.79747 7.10349 5.79747 7.5Z" fill={fill} fillOpacity="0.9" />
    </svg>
  )
}
