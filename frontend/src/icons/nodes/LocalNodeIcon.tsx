import React from "react"

const LocalNodeIcon = ({ fill='#3399CC', ...props }) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M14.4086 4L19.2419 6.16817C19.7035 6.37521 20 6.83067 20 7.33258V18.3653C20 19.2941 19.0316 19.9129 18.1774 19.5297L14.4086 17.8391L9.5914 20L4.75805 17.8318C4.29651 17.6248 4 17.1693 4 16.6674V5.63471C4 4.70585 4.96844 4.08714 5.82259 4.4703L9.5914 6.16093L14.4086 4ZM8.8172 7.49745L5.54839 6.03111V16.5025L8.8172 17.9689V7.49745ZM10.3656 17.9689L13.6344 16.5025V6.03111L10.3656 7.49745V17.9689ZM15.1828 6.03111V16.5025L18.4516 17.9689V7.49745L15.1828 6.03111Z'
        fill={fill}
      />
    </svg>
  )
}

export default LocalNodeIcon
