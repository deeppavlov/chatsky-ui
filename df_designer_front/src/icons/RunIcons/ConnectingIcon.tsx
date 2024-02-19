import React from 'react'
import { SVGElementInterface } from '../../types/components'

const ConnectingIcon = ({ className }: SVGElementInterface) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 15.9737V3M12 3L9 6M12 3L15 6M15.3775 10C16.0164 10.5706 16.5262 11.2771 16.8589 12.0728C17.1861 11.991 17.529 11.9475 17.8824 11.9475C20.1565 11.9475 22 13.7501 22 15.9737C22 18.1974 20.1565 20 17.8824 20H5.52941C3.58017 20 2 18.4549 2 16.5489C2 14.6429 3.58017 13.0978 5.52941 13.0978C5.56866 13.0978 5.60776 13.0984 5.64669 13.0997C5.97769 11.5025 6.98545 10.1455 8.36462 9.32723" stroke="#8D96B5" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  )
}

export default ConnectingIcon