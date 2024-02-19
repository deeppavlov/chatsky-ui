import React, { MouseEventHandler, useContext, useState } from 'react'
import ShadTooltip from '../../ShadTooltipComponent'
import { buildContext } from '../../../contexts/buildContext'
import { Check, CheckIcon, ChevronDown, Plus } from 'lucide-react'
import BuildedCheckIcon from '../../../icons/BuildedCheckIcon/BuildedCheckIcon'
import BuildLoaderIcon from '../../../icons/BuildLoaderIcon'
import { Wrench } from 'lucide-react'
import RunIcon from '../../../icons/RunIcons/RunIcon'
import { classNames } from '../../../utils'
import StopIcon from '../../../icons/RunIcons/StopIcon'
import PresetDropdownItem from '../ui/PresetDropdownItem'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { useTransition, a } from '@react-spring/web'
import { savedBuildType, savedRunType } from '../../../types/entities'
import { alertContext } from '../../../contexts/alertContext'
import { BuildRunPresetType } from './BuildButton'
import { mock_presets } from '../../../constants'

export type RunButtonType = {
  className?: string
}

const RunButton = ({ className }: RunButtonType) => {
  const { run, connectionStatus, runPending, runStart, builded } =
    useContext(buildContext)
  const { setErrorData } = useContext(alertContext)
  const [isOpen, setIsOpen] = useState(false)
  const [preset, setPreset] = useState<BuildRunPresetType>('default')

  const presetHandler = (preset_name: BuildRunPresetType) => {
    if (preset_name !== preset) {
      setPreset(preset_name)
    } else {
      setPreset('default')
    }
    setIsOpen(false)
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
  

  const runBotHandler = () => {
    if (!builded) {
      return setErrorData({title: 'Build first'})
    }
    runStart({
      name: mock_presets[preset].name,
      duration: mock_presets[preset].duration,
      end_status: mock_presets[preset].end_status,
    })
  }

  return (
    <div
      className="relative"
      ref={presetsRef}>
      <div
        className={classNames(
          ' flex items-center justify-center rounded transition hover:bg-accent',
          isOpen && 'bg-accent',
          className
        )}>
        <ShadTooltip
          side="bottom"
          content={run ? 'Stop' : 'Run'}>
          <button
            onClick={runBotHandler}
            className={classNames(
              `extra-side-bar-save-disable relative flex flex-col items-center justify-center`
            )}>
            {!runPending &&
              (run ? (
                <StopIcon
                  className="side-bar-button-size"
                  opacity={'0.9'}
                />
              ) : (
                <RunIcon
                  className="side-bar-button-size"
                  opacity={'0.9'}
                />
              ))}
            {runPending && <BuildLoaderIcon className="side-bar-button-size build-loader" />}
            <span
              className={classNames(
                'side-bar-button-size builded-check z-10 transition-all duration-300',
                run ? 'bg-emerald-500' : 'bg-red-500',
                runPending && 'bg-warning',
                connectionStatus === 'not open' && 'bg-transparent'
              )}
            />
            {/* {run && <span className="side-bar-button-size builded-check bg-green-500 rounded-full z-10" />}
        {!run && connectionStatus === 'closed' && <Plus stroke="hsl(var(--foreground))" className="side-bar-button-size builded-check rotate-45 bg-red-600 rounded-full z-10" />} */}
          </button>
        </ShadTooltip>
        <ShadTooltip
          content="Run presets"
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
              <span className="preset-select-title">Run as{':'}</span>
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

export default RunButton
