import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react'
import { savedBuildType, savedRunType } from '../../types/entities'
import { Check, ChevronLeft, Plus, Radio } from 'lucide-react'
import { classNames } from '../../utils'
import BuildLoaderIcon from '../../icons/BuildLoaderIcon'
import { buildApiType, buildContext, runApiType } from '../../contexts/buildContext'

const BuildLogItem = ({
  build,
  setCurrentItem,
  currentItem,
}: {
  build: buildApiType
  setCurrentItem: Dispatch<SetStateAction<runApiType | buildApiType>>
  currentItem: runApiType | buildApiType
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { run, builded } = useContext(buildContext)
  const is_build = currentItem?.['build_id'] ? true : false
  useEffect(() => {
    if (currentItem) {
      if (build.runs && run && currentItem?.['build_id']) {
        if (build.runs.some((run) => run.timestamp === currentItem.timestamp)) {
          setIsOpen((prev) => true)
        }
      }
      if (!currentItem?.['build_id'] && build && builded) {
        if (build.timestamp === currentItem.timestamp) {
          setIsOpen((prev) => true)
        }
      }
    }
  }, [run, builded])
  const accordionRef = useRef<HTMLDivElement>(null)

  console.log()

  return (
    <div className="flex w-full flex-col">
      <div
        onClick={() => setCurrentItem(build)}
        className={classNames(
          'mr-5 flex cursor-pointer flex-row items-center justify-between rounded px-2 py-2',
          !currentItem?.['build_id'] && currentItem?.timestamp === build?.timestamp && 'bg-accent'
        )}>
        <div className="flex flex-row items-center justify-start gap-2">
          {build.status === 'completed' ? (
            <span className="flex w-max items-center justify-center rounded-full bg-green-400 p-0.5">
              {' '}
              <Check className="h-4 w-4" />{' '}
            </span>
          ) : (
            <span className="flex w-max items-center justify-center rounded-full bg-red-500 p-0.5">
              {' '}
              <Plus className="h-4 w-4 rotate-45" />{' '}
            </span>
          )}
          <h6 className="font-bold">Build {build.id}</h6>
        </div>
        <div className="flex flex-row items-center justify-end gap-2">
          <span className="text-sm text-ring">
            {build['ago'] === 'now' ? 'now' : `${build['ago']} ago`}
          </span>
          <button onClick={() => setIsOpen(!isOpen)}>
            <ChevronLeft className={classNames('h-3 w-3 transition-all', isOpen && '-rotate-90')} />
          </button>
        </div>
      </div>
      <div
        ref={accordionRef}
        className="w-full overflow-hidden transition-all duration-200"
        style={{
          maxHeight: isOpen ? accordionRef?.current?.scrollHeight : 0,
        }}>
        {build.runs
          ?.map((run) => (
            <div
              onClick={() => setCurrentItem(run)}
              key={run.timestamp}
              className={classNames(
                'mr-5 flex cursor-pointer flex-row items-center justify-between rounded px-4 py-1',
                currentItem?.['build_id'] &&
                  currentItem?.timestamp === run?.timestamp &&
                  'bg-accent'
              )}>
              <div className="flex flex-row items-center justify-start gap-2">
                {run.status === 'completed' && (
                  <span className="flex w-max items-center justify-center rounded-full bg-green-400 p-0.5">
                    {' '}
                    <Check className="h-4 w-4" />{' '}
                  </span>
                )}
                {run.status === 'failed' && (
                  <span className="flex w-max items-center justify-center rounded-full bg-red-500 p-0.5">
                    {' '}
                    <Plus className="h-4 w-4 rotate-45" />{' '}
                  </span>
                )}
                {run.status === 'running' && <BuildLoaderIcon className="build-loader h-5 w-5" />}
                <h6 className="font-bold">Run {run.id}</h6>
              </div>
              <span className="text-sm text-ring">
                {run.status === 'running' ? (
                  <span className="flex flex-row items-center justify-center gap-1 text-red-600">
                    Live <Radio className="h-5" />{' '}
                  </span>
                ) : (
                  <>{run['ago'] === 'now' ? 'now' : `${run['ago']} ago`}</>
                )}
              </span>
            </div>
          ))
          .reverse()}
      </div>
    </div>
  )
}

export default BuildLogItem
