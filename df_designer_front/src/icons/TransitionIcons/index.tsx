import React, { useContext } from 'react'
import { SVGElementInterface } from '../../types/components'
import { darkContext } from '../../contexts/darkContext'

export const forward = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path d="M1 1L5 4L1 7M7 1L11 4L7 7" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const backward = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path d="M11 7L7 4L11 1M5 7L1 4L5 1" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const repeat = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M12 2.00004V4.88676C12 4.94196 11.9642 5.00468 11.92 5.00468H9.5M12 7.63624C11 10.1362 7.4992 10.5654 5.56181 9.12389C3.55819 7.63311 3.544 4.65154 5.1664 3.16075C7.33628 1.1669 10.5 2.08934 11.5999 4.16689" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export const previous = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M2.74939 9.23478L2.74939 5.92989L2.74939 3L2.74939 9.23478ZM13.0071 2.78802C13.0304 2.7982 13.0481 2.8087 13.0605 2.81758V9.18242C13.0481 9.1913 13.0304 9.2018 13.0071 9.21198C12.8945 9.26099 12.742 9.26537 12.6196 9.20891L5.66329 6L12.6196 2.79109C12.742 2.73463 12.8945 2.73901 13.0071 2.78802Z" stroke={fill} strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export const to_start = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M4.34849 10.4117C3.20312 10.4117 2.27456 10.2032 1.56281 9.78618C1.28583 9.62388 1.23783 9.28789 1.40941 9.03239C1.61521 8.72594 2.06101 8.64409 2.42237 8.78986C2.99705 9.02168 3.64471 9.13759 4.36533 9.13759C4.89316 9.13759 5.31991 9.03141 5.64558 8.81905C5.98249 8.60669 6.15095 8.32531 6.15095 7.97492C6.15095 7.41217 5.5782 6.97683 4.43271 6.66891L3.55675 6.44593C2.74817 6.23357 2.13612 5.96282 1.7206 5.63366C1.30508 5.3045 1.09732 4.832 1.09732 4.21616C1.09732 3.43043 1.40053 2.79866 2.00697 2.32085C2.62464 1.83243 3.43322 1.58821 4.43271 1.58821C5.44977 1.58821 6.33101 1.75613 7.07644 2.09196C7.41273 2.24347 7.49863 2.6271 7.30382 2.91838C7.09647 3.2284 6.65008 3.31683 6.28104 3.17772C5.75147 2.97811 5.17466 2.8783 4.55063 2.8783C4.04527 2.8783 3.63536 2.97917 3.32091 3.18091C3.00647 3.38265 2.84924 3.6481 2.84924 3.97726C2.84924 4.27456 2.97839 4.51346 3.23669 4.69397C3.49498 4.86386 3.8712 5.01782 4.36533 5.15585L5.24129 5.37883C7.01568 5.8354 7.90287 6.65829 7.90287 7.8475C7.90287 8.62262 7.57719 9.24377 6.92584 9.71096C6.28571 10.1781 5.42659 10.4117 4.34849 10.4117Z" fill={fill} fillOpacity="0.7" />
      <path fillRule="evenodd" clipRule="evenodd" d="M5.59003 8.7466C5.90271 8.54951 6.05363 8.29436 6.05363 7.97494C6.05363 7.72504 5.92816 7.4987 5.65887 7.29402C5.3871 7.08745 4.97209 6.90603 4.40569 6.75372L3.5304 6.53091C2.71468 6.31667 2.08691 6.04105 1.65657 5.70015C1.21513 5.35046 1 4.85113 1 4.21618C1 3.40718 1.3136 2.75029 1.94306 2.25431C2.5821 1.749 3.41506 1.5 4.43262 1.5C5.4614 1.5 6.35805 1.66987 7.11958 2.01295C7.51548 2.19132 7.60595 2.63656 7.38683 2.96418C7.14938 3.31921 6.64714 3.41132 6.24366 3.25923C5.72691 3.06445 5.16291 2.96655 4.55054 2.96655C4.05905 2.96655 3.67053 3.06462 3.37694 3.25298C3.08639 3.43939 2.94637 3.67879 2.94637 3.97728C2.94637 4.24693 3.06129 4.4597 3.29479 4.6233C3.54056 4.78467 3.90458 4.93479 4.39267 5.07122L5.26745 5.29389C6.16402 5.52459 6.84724 5.85042 7.30687 6.27674C7.76889 6.70527 8 7.2307 8 7.84753C8 8.64859 7.66159 9.29552 6.98636 9.77997C6.32425 10.2631 5.44151 10.5 4.34839 10.5C3.19072 10.5 2.24207 10.2893 1.50998 9.86033C1.18004 9.667 1.133 9.27434 1.3263 8.9865C1.56291 8.63414 2.06593 8.54958 2.46176 8.70925C3.02232 8.93537 3.65624 9.04937 4.36524 9.04937C4.87909 9.04937 5.28414 8.94604 5.58876 8.74741L5.59003 8.7466ZM6.92584 9.71096C7.57719 9.24377 7.90287 8.62262 7.90287 7.8475C7.90287 6.65829 7.01568 5.8354 5.24129 5.37883L4.36533 5.15585C3.8712 5.01782 3.49498 4.86386 3.23669 4.69397C2.97839 4.51346 2.84924 4.27456 2.84924 3.97726C2.84924 3.6481 3.00647 3.38265 3.32091 3.18091C3.63536 2.97917 4.04527 2.8783 4.55063 2.8783C5.17466 2.8783 5.75147 2.97811 6.28104 3.17772C6.65008 3.31683 7.09647 3.2284 7.30382 2.91838C7.49863 2.6271 7.41273 2.24347 7.07644 2.09196C6.33101 1.75613 5.44977 1.58821 4.43271 1.58821C3.43322 1.58821 2.62464 1.83243 2.00697 2.32085C1.40053 2.79866 1.09732 3.43043 1.09732 4.21616C1.09732 4.832 1.30508 5.3045 1.7206 5.63366C2.13612 5.96282 2.74817 6.23357 3.55675 6.44593L4.43271 6.66891C5.5782 6.97683 6.15095 7.41217 6.15095 7.97492C6.15095 8.32531 5.98249 8.60669 5.64558 8.81905C5.31991 9.03141 4.89316 9.13759 4.36533 9.13759C3.64471 9.13759 2.99705 9.02168 2.42237 8.78986C2.06101 8.64409 1.61521 8.72594 1.40941 9.03239C1.23783 9.28789 1.28583 9.62388 1.56281 9.78618C2.27456 10.2032 3.20312 10.4117 4.34849 10.4117C5.42659 10.4117 6.28571 10.1781 6.92584 9.71096Z" fill={fill} fillOpacity="0.7" />
      <path fillRule="evenodd" clipRule="evenodd" d="M14.2835 9.20018C14.0349 9.53151 13.5648 9.59859 13.2334 9.35L9.3401 6.42891C8.88682 6.08883 8.88694 5.40883 9.34034 5.06891L13.2337 2.15C13.5651 1.90153 14.0352 1.96877 14.2836 2.30018C14.5321 2.6316 14.4649 3.10169 14.1334 3.35016L10.9335 5.74919L14.1337 8.15016C14.465 8.39875 14.5321 8.86886 14.2835 9.20018Z" fill={fill} fillOpacity="0.7" />
    </svg>
  )
}

export const to_fallback = ({ className }: SVGElementInterface) => {
  const { dark } = useContext(darkContext)
  const fill = dark ? "white" : "black"
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M14 2.5C14 3.05228 13.5523 3.50133 13 3.50133H10V5.5H12C12.5523 5.5 13 5.44904 13 6.00133C13 6.55361 12.5523 7.00133 12 7.00133H10V9.00133C10 9.55361 9.55233 10 9.00004 10C8.44776 10 8.50004 9.55361 8.50004 9.00133V3.00133C8.50004 2.44904 8.94776 2.00133 9.50004 2.00133H13C13.5523 2.00133 14 1.94772 14 2.5Z" fill={fill} fillOpacity="0.7" />
      <path fillRule="evenodd" clipRule="evenodd" d="M1.90012 2.54876C2.14871 2.21743 2.61882 2.15036 2.95015 2.39895L6.8435 5.32004C7.29677 5.66012 7.29665 6.34012 6.84326 6.68004L2.94994 9.59895C2.61852 9.84742 2.14843 9.78018 1.89996 9.44876C1.6515 9.11735 1.71874 8.64726 2.05015 8.39879L5.25004 5.99976L2.04994 3.59879C1.71861 3.3502 1.65154 2.88009 1.90012 2.54876Z" fill={fill} fillOpacity="0.7" />
    </svg>
  )
}