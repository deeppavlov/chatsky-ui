import React from 'react'
import { SVGElementInterface } from '../../types/components'

export const GrabberIcon = ({ className, fill }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
      <path d="M14 6.12821C14 5.61538 14.4471 4.58974 15.5 4.58974C16.5529 4.58974 17 5.5137 17 6.64103V11.7692C17 15.359 17 21 11 21H8.5C7 21 6.2078 19.9744 5.70614 19.4615C5.20447 18.9487 2.20894 13.8205 1.70614 13.3077C1.32822 12.9223 0.954425 12.2471 1.00453 11.5C1.02109 11.2531 1.08395 10.9983 1.20825 10.7436C1.70007 9.73559 2.67684 9.94621 3.4591 10.4721C3.48642 10.4905 3.51152 10.5119 3.53438 10.5356L4.18453 11.2088C4.2091 11.2343 4.23597 11.2579 4.2672 11.2745C4.59312 11.448 5 11.2137 5 10.8318V4.58974C5 3.72388 5.77115 3.05128 6.5 3.05128C7.22885 3.05128 8 3.23377 8 4.65955M14 6.12821V9.71795M14 6.12821V3.56507L14 3.56187C13.9885 2.30048 13.7054 1.51282 12.5 1.51282C11.2939 1.51282 11 2.67682 11 3.5641M11 3.5641V9.71795M11 3.5641V2.54285L11.0001 2.53398C11.0154 1.57754 10.4984 1 9.5 1C8.88559 1 8 1.51282 8 2.53846V4.65955M8 4.65955V9.71795" stroke={fill} strokeOpacity='0.7' strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
