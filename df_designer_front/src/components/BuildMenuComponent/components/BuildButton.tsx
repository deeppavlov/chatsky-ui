import { Dispatch, MouseEventHandler, SetStateAction, useContext, useRef, useState } from 'react'
import ShadTooltip from '../../ShadTooltipComponent'
import { buildContext } from '../../../contexts/buildContext'
import { Check, CheckIcon, ChevronDown, Plus } from 'lucide-react'
import BuildedCheckIcon from '../../../icons/BuildedCheckIcon/BuildedCheckIcon'
import BuildLoaderIcon from '../../../icons/BuildLoaderIcon'
import { Wrench } from 'lucide-react'
import { classNames } from '../../../utils'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import PresetDropdownItem from '../ui/PresetDropdownItem'
import { useTransition, a } from '@react-spring/web'
import { alertContext } from '../../../contexts/alertContext'
import { savedBuildType } from '../../../types/entities'
import { buildBotScript } from '../../../controllers/API/build'
import { mock_presets } from '../../../constants'

export type BuildButtonType = {
  setBuildMenu: Dispatch<SetStateAction<boolean>>
  className?: string
}

export type BuildRunPresetType = 'success' | 'error' | 'default' | 'deferred'

const BuildButton = ({ className, setBuildMenu }: BuildButtonType) => {
  const { builded, buildStatus, buildStart, buildPending } = useContext(buildContext)
  const { setSuccessData, setErrorData } = useContext(alertContext)
  const [isOpen, setIsOpen] = useState(false)
  const [preset, setPreset] = useState<BuildRunPresetType>('default')
  // const [buildPending, setBuildPending] = useState(false)

  const presetHandler = (preset_name: BuildRunPresetType) => {
    if (preset_name !== preset) {
      setPreset(preset_name)
    } else {
      setPreset('default')
    }
    setIsOpen(false)
  }

  const buildBotHandler = async () => {
    buildStart({
      name: mock_presets[preset].name,
      duration: mock_presets[preset].duration,
      end_status: mock_presets[preset].end_status,
    })
  }

  const presetsRef = useOutsideClick(() => {
    setIsOpen(false)
  })

  const presetMenuTransition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-10px)' },
    config: { duration: 100 },
  })

  return (
    <div
      className="relative"
      ref={presetsRef}>
      <div
        className={classNames(
          'flex items-center justify-center rounded transition hover:bg-accent',
          isOpen && 'bg-accent'
        )}>
        <ShadTooltip
          side="bottom"
          content={builded ? 'Rebuild' : 'Build'}>
          <button
            onClick={buildBotHandler}
            className={classNames(
              `extra-side-bar-save-disable relative flex flex-col items-center justify-center`,
              className
            )}>
            {!buildPending && (
              <Wrench
                className="side-bar-button-size text-[hsl(var(--foreground))]"
                opacity={0.9}
              />
            )}
            {buildPending && <BuildLoaderIcon className="side-bar-button-size build-loader" />}
            <span
              className={classNames(
                'side-bar-button-size builded-check z-10 transition-all duration-300',
                builded
                  ? 'bg-emerald-500'
                  : buildStatus === 'not builded'
                  ? 'bg-transparent'
                  : 'bg-red-500',
                buildPending && 'bg-warning'
              )}
            />
            {/* {!builded && <Plus stroke="hsl(var(--foreground))" className="side-bar-button-size builded-check rotate-45 bg-red-600 rounded-full z-10" />} */}
            {/* {connectionStatus !== 'closed' && connectionStatus !== 'not open' && <span style={{ backgroundColor: connectionStatus === 'alive' ? '#0C9' : '#f00' }} className="absolute rounded-full -top-0 -left-0 w-2 h-2" />} */}
          </button>
        </ShadTooltip>
        <ShadTooltip
          content="Build presets"
          side="bottom">
          <button
            className={classNames('preset-open-btn', isOpen && 'border-border bg-accent')}
            onClick={() => setIsOpen((prev) => !isOpen)}>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>
        </ShadTooltip>
      </div>
      {presetMenuTransition((style, flag) => (
        <>
          {flag && (
            <a.div
              style={style}
              className="preset-select overflow-hidden">
              <span className="preset-select-title">Build as{':'}</span>
              <PresetDropdownItem
                preset={preset}
                presetHandler={presetHandler}
                presetName="success"
              />
              <PresetDropdownItem
                preset={preset}
                presetHandler={presetHandler}
                presetName="error"
              />
              <PresetDropdownItem
                preset={preset}
                presetHandler={presetHandler}
                presetName="deferred"
              />
              <button
                className="run-button-option justify-center bg-[#ff000045] transition hover:bg-red-500 "
                onClick={() => setIsOpen(false)}>
                {' '}
                Close{' '}
              </button>
            </a.div>
          )}
        </>
      ))}
    </div>
  )
}

export default BuildButton
