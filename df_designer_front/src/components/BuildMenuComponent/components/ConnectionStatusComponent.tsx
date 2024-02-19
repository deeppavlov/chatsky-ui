import React, { useCallback, useContext } from 'react'
import { buildContext } from '../../../contexts/buildContext'
import ConnectionGoodIcon from '../../../icons/RunIcons/ConnectionGoodIcon'
import ConnectionLostIcon from '../../../icons/RunIcons/ConnectionLostIcon'
import ConnectingIcon from '../../../icons/RunIcons/ConnectingIcon'
import { classNames } from '../../../utils'
import ShadTooltip from '../../ShadTooltipComponent'

type connectionStatusComponentType = {
  className?: string
}

const ConnectionStatusComponent = ({ className }: connectionStatusComponentType) => {

  const { connectionStatus } = useContext(buildContext)

  const connectionStatusHandler = useCallback(() => {
    switch (connectionStatus) {
      case 'alive': return {
        icon: <ConnectionGoodIcon />,
        status: 'Stable connection'
      }
      case 'broken': return {
        icon: <ConnectionLostIcon />,
        status: 'Connection broken'
      }
      case 'closed': return {
        icon: <ConnectionLostIcon />,
        status: 'Connection closed'
      }
      case 'not open': return {
        icon: <ConnectionLostIcon />,
        status: 'Connection not opened'
      }
      case 'pending': return {
        icon: <ConnectingIcon />,
        status: 'Trying to connect...'
      }
    }
    return {
      icon: <></>,
      status: 'error'
    }
  }, [connectionStatus])

  return (
    <ShadTooltip side='bottom' content={connectionStatusHandler().status}>
      <div className={classNames('cursor-pointer extra-side-bar-save-disable hover:bg-transparent hover:border-transparent relative flex flex-col items-center justify-center', className)}>
        {connectionStatusHandler().icon}
      </div>
    </ShadTooltip>
  )
}

export default ConnectionStatusComponent