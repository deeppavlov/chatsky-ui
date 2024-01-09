import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const MyStoragePresetsIcon = ({fill="hsl(var(--foreground))"}:SVGElementInterface) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M7.56404 7.1875L10.7947 7.1875C10.7947 7.1875 9.71782 4 12.9485 4C16.1792 4 15.1023 7.1875 15.1023 7.1875L18.3331 7.1875L18.3329 10.375C18.3329 10.375 15.1023 9.3125 15.1023 12.5C15.1023 15.6875 18.3329 14.625 18.3329 14.625L18.3329 17.8125L15.1023 17.8125C15.1023 17.8125 16.1792 21 12.9485 21C9.71782 21 10.7947 17.8125 10.7947 17.8125L7.56404 17.8125L7.56404 14.625C7.56404 14.625 4.33337 15.6875 4.33337 12.5C4.33337 9.3125 7.56404 10.375 7.56404 10.375L7.56404 7.1875Z" stroke={fill} stroke-opacity="0.7" stroke-width="1.5" />
    </svg>
  )
}
