import React from "react"

const CodeConditionIcon = ({className, fill="var(--foreground)"}: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      className={className}
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M16.3767 7.28616C16.6887 6.9844 17.1944 6.9844 17.5063 7.28616L21.7661 11.4073C22.078 11.709 22.078 12.1983 21.7661 12.5L17.5063 16.6212C17.1944 16.9229 16.6887 16.9229 16.3767 16.6212C16.0648 16.3194 16.0648 15.8301 16.3767 15.5284L20.0717 11.9537L16.3767 8.37893C16.0648 8.07717 16.0648 7.58792 16.3767 7.28616Z'
        fill={fill}
        fill-opacity='0.7'
      />
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M7.62326 16.6523C7.31134 16.9541 6.80563 16.9541 6.49371 16.6523L2.23394 12.5312C1.92202 12.2295 1.92202 11.7402 2.23394 11.4385L6.49371 7.31734C6.80563 7.01558 7.31134 7.01558 7.62326 7.31734C7.93517 7.6191 7.93517 8.10836 7.62326 8.41012L3.92825 11.9848L7.62326 15.5596C7.93517 15.8613 7.93517 16.3506 7.62326 16.6523Z'
        fill={fill}
        fill-opacity='0.7'
      />
      <path
        fill-rule='evenodd'
        clip-rule='evenodd'
        d='M15.0542 4.04744C15.4684 4.19435 15.681 4.63826 15.5292 5.03893L9.67198 19.4931C9.52013 19.8938 9.06129 20.0995 8.64713 19.9526C8.23298 19.8056 8.02035 19.3617 8.1722 18.9611L14.0294 4.50691C14.1813 4.10624 14.6401 3.90053 15.0542 4.04744Z'
        fill={fill}
        fill-opacity='0.7'
      />
    </svg>
  )
}

export default CodeConditionIcon
