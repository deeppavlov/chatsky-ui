import React from "react"

const EditPenIcon = ({ stroke = "var(--foreground)", className }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='15'
      height='17'
      viewBox='0 0 15 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M11.3779 7.05474L12.3457 5.98101C13.3712 4.84678 13.8334 3.55377 12.2373 1.97341C10.6412 0.400622 9.4351 0.952611 8.40954 2.08684L2.4801 8.65778C2.25621 8.90731 2.03954 9.3988 1.99621 9.73907L1.72898 12.189C1.6351 13.0737 2.24176 13.6786 3.07954 13.5274L5.4051 13.1115C5.7301 13.051 6.1851 12.8015 6.40898 12.5444L9.26176 9.38368M7.4196 3.1833C7.73015 5.27027 9.34793 6.86575 11.3557 7.07747M1 16H8.94444M11.8333 16H14'
        stroke={stroke}
        strokeOpacity='0.9'
        strokeWidth='1.5'
        strokeMiterlimit='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default EditPenIcon
