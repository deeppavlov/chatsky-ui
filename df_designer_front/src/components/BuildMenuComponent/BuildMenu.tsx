import React, { Dispatch, MouseEventHandler, SetStateAction, useContext } from 'react'
import ConnectionStatusComponent from './components/ConnectionStatusComponent'
import RunButton from './components/RunButton'
import BuildButton from './components/BuildButton'
import NewChatIcon from '../../icons/RunIcons/NewChatIcon'
import NewLogsIcon from '../../icons/RunIcons/NewLogsIcon'
import { buildContext } from '../../contexts/buildContext'
import { ChevronLeft } from 'lucide-react'
import { classNames } from '../../utils'
import ShadTooltip from '../ShadTooltipComponent'

export type buildMenuType = {
  buildMenu: boolean
  setBuildMenu: Dispatch<SetStateAction<boolean>>
}

const BuildMenu = ({ buildMenu, setBuildMenu }: buildMenuType) => {

  const { setLogsPage, logsPage, setChat, chat } = useContext(buildContext)

  return (
    <div className={classNames("build-menu", !buildMenu && 'build-menu-closed')}>
      <button onClick={() => setBuildMenu(!buildMenu)}>
        <ChevronLeft className={classNames('extra-side-bar-save-disable p-0 h-[34px]', buildMenu && 'rotate-180')} />
      </button>
      <ConnectionStatusComponent className={classNames('transition-all duration-300 build-menu-item', !buildMenu && 'build-menu-item-disabled')} />
      <BuildButton  setBuildMenu={setBuildMenu} />
      <RunButton className={classNames('transition-all duration-300 build-menu-item-long', !buildMenu && 'build-menu-item-disabled')} />
      <ShadTooltip side='bottom' content="Chat">
        <button onClick={() => setChat(!chat)} className={classNames("extra-side-bar-save-disable relative flex flex-col items-center justify-center build-menu-item", !buildMenu && 'build-menu-item-disabled', chat && 'bg-accent')}>
          <NewChatIcon />
        </button>
      </ShadTooltip>
      <ShadTooltip side='bottom' content="Logs">
        <button onClick={() => setLogsPage(!logsPage)} className={classNames("extra-side-bar-save-disable relative flex flex-col items-center justify-center build-menu-item", !buildMenu && 'build-menu-item-disabled', logsPage && 'bg-accent')}>
          <NewLogsIcon />
        </button>
      </ShadTooltip>
    </div>
  )
}

export default BuildMenu