import { checkBuildIsChanged } from '@/api/bot'
import Accordion, { StringItem } from '@/components/deliver/Accordion'
import BuildForm from '@/components/deliver/BuildForm'
import StartRunForm from '@/components/deliver/StartRunForm'
import { buildContext } from '@/contexts/buildContext'
import { flowContext } from '@/contexts/flowContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { runContext } from '@/contexts/runContext'
import { workspaceContext } from '@/contexts/workspaceContext'
import CheckIcon from '@/icons/CheckIcon'
import MicroscopeIcon from '@/icons/MicroscopeIcon'
import Tools from '@/icons/Tools'
import RebuildModal from '@/modals/RebuildModal/RebuildModal'
import RestoreBuildModal from '@/modals/RestoreBuildModal/RestoreBuildModal'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { formatRelativeTime, formatTimestamp } from '@/utils'
import { Button, Divider, Tooltip } from '@nextui-org/react'
import { RefreshCw, SquareArrowOutUpRight, SquareIcon, X } from 'lucide-react'
import { useContext, useState } from 'react'

interface IMessengersMap {
  web: string
  telegram: string
}
const messengerMap: IMessengersMap = {
  telegram: 'Telegram',
  web: 'Preview',
}

const BuildManagerPage = () => {
  const { currentTab } = useContext(workspaceContext)
  const { saveFlows, flows } = useContext(flowContext)
  const {
    buildStart,
    builds: reversedBuilds,
    buildStop,
  } = useContext(buildContext)
  const { getFlows } = useContext(flowContext)
  const {
    runStart,
    runStop,
    stopAllRuns,
    startingRunId,
    runStopping,
    stoppingRunIds,
    runs: reversedRuns,
  } = useContext(runContext)
  const { openPopUp } = useContext(PopUpContext)
  const runs = [...reversedRuns].reverse()
  const builds = [...reversedBuilds].reverse()

  const aliveRuns = runs.filter(
    (r) => r.status === 'alive' || r.status === 'running',
  )
  const previousRuns = runs.filter(
    (r) =>
      r.status !== 'failed' && r.status !== 'alive' && r.status !== 'running',
  )
  const failedRuns = runs.filter((r) => r.status === 'failed')

  const handleRestoreBuild = (id: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    openPopUp(
      <RestoreBuildModal
        id='restoreBuild'
        onRestore={async () => {
          const flows = await getFlows(id)
          saveFlows(flows)
        }}
      />,
      'restoreBuild',
    )
  }

  const [loading, setLoading] = useState(false)
  const handleConfirmRebuild = () => {
    openPopUp(
      <RebuildModal
        id='rebuild'
        onRebuild={async () => {
          const newBuildName = `Build ${builds.length}`
          const newRunName = `Run ${runs.length}`
          setLoading(true)
          const { status, build_id } = await buildStart({
            end_status: 'success',
            messenger: 'web',
            preset: 'None',
            name: newBuildName,
          })

          if (status === 'completed') {
            await runStart(String(build_id), {
              end_status: 'success',
              preset: 'None',
              name: newRunName,
              build_name: newBuildName,
            })
          }
          setLoading(false)
        }}
      />,
      'rebuild',
    )
  }

  const buildAndRunHandler = async () => {
    saveFlows(flows)
    const newBuildName = `Build ${builds.length}`
    const newRunName = `Run ${runs.length}`

    const flowUpdated = await checkBuildIsChanged()

    if (!flowUpdated) {
      handleConfirmRebuild()
      return
    }
    setLoading(true)

    const { status, build_id } = await buildStart({
      end_status: 'success',
      messenger: 'web',
      preset: 'None',
      name: newBuildName,
    })

    if (status === 'completed') {
      await runStart(String(build_id), {
        end_status: 'success',
        preset: 'None',
        name: newRunName,
        build_name: newBuildName,
      })
    }
    setLoading(false)
  }

  const handleStopRuns = async () => {
    const ids = aliveRuns.map((run) => run.id)
    await stopAllRuns(ids)
  }

  return (
    <div
      style={{
        transform:
          currentTab === 'deliver' ? 'translateX(0)' : 'translateX(100%)',
      }}
      className='absolute left-0 top-0 flex h-screen w-screen flex-col bg-background px-10 pb-12 pt-24 transition-all duration-300'
    >
      {/* HEADER */}
      <div className='mb-4 flex w-full justify-between px-3 align-middle'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl font-semibold'>Deliver</h2>
          <Button
            disableRipple
            disabled={loading}
            className='rounded-lg bg-foreground text-background'
            onClick={buildAndRunHandler}
            data-testid='build-and-run-btn'
          >
            {/* АНИМАЦИЯ */}
            {loading && (
              <div className='absolute inset-0 z-0 h-full w-full animate-fill-progress bg-background opacity-50'></div>
            )}
            <Tools className='z-10' />
            <span className='z-10 text-background'>Quick build and run</span>
          </Button>
        </div>
        <Button
          isDisabled
          className='flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-btn-accent'
        >
          <MicroscopeIcon />
          <span className='text-sm font-semibold'>Test panel</span>
        </Button>
      </div>

      {/* SUBHEADER */}
      <div className='flex h-0 flex-grow flex-col gap-4 align-middle'>
        <div className='grid w-full flex-grow-0 grid-cols-5 gap-12 px-3'>
          <h3 className='text-lg font-semibold'>New build</h3>
          <h3 className='text-lg font-semibold'>Existing builds</h3>
          <h3 className='text-lg font-semibold'>New run</h3>
          <h3 className='text-lg font-semibold'>Running</h3>
          <h3 className='text-lg font-semibold'>Previous runs</h3>
        </div>

        <div className='grid h-0 flex-grow grid-cols-5 grid-rows-1 gap-12 px-3 pb-8'>
          <div className='relative h-full'>
            <div className='bg flex h-full w-full flex-col gap-4'>
              <BuildForm />
            </div>
            <Divider
              orientation='vertical'
              className='absolute right-[-24px] top-0 h-full'
            />
          </div>

          {/* EXISTING BUILDS */}
          <div className='relative h-full'>
            <div className='flex h-full justify-between gap-6'>
              <ScrolledContainer>
                {builds.map((b) => {
                  const relativeBuildTime = formatRelativeTime(b.timestamp)
                  return (
                    <Accordion
                      isLoading={b.status === 'running'}
                      key={b.id}
                      title={b.preset.name}
                      infoBlock={
                        <div className='flex items-center gap-1 overflow-hidden'>
                          <span className='truncate text-input-border sm:text-xs md:text-sm'>
                            {relativeBuildTime}
                          </span>
                          {b.status === 'failed' && (
                            <X
                              strokeWidth={3.5}
                              className='size-3.5 flex-shrink-0 stroke-danger'
                            />
                          )}

                          {b.status === 'completed' && (
                            <>
                              <CheckIcon className='flex-shrink-0' />
                              <button
                                onClick={handleRestoreBuild(b.id)}
                                className='flex h-6 w-6 items-center justify-center hover:scale-105 active:scale-95'
                              >
                                <SquareArrowOutUpRight className='size-4 stroke-foreground' />
                              </button>
                            </>
                          )}
                          {b.status === 'running' && (
                            <Tooltip
                              classNames={{
                                content: [
                                  'h-8 px-3 shadow-lg rounded-[6px] bg-background border border-border text-[10px]',
                                ],
                              }}
                              content='Stop building'
                              placement='bottom'
                              offset={4}
                            >
                              <button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation()
                                  buildStop(b.id)
                                }}
                                className='flex h-6 w-6 items-center justify-center fill-input-border stroke-none hover:fill-text-secondary active:scale-95'
                              >
                                <SquareIcon className='size-[18px] fill-inherit stroke-inherit' />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      }
                    >
                      <StringItem
                        content={[
                          'Messenger: ',
                          messengerMap[b.preset.messenger],
                        ]}
                      />
                      <StringItem content={['Preset: ', b.preset.preset]} />
                      <StringItem
                        content={['Date: ', formatTimestamp(b.timestamp)]}
                      />
                      <StringItem content={['Status: ', b.status]} />
                    </Accordion>
                  )
                })}
              </ScrolledContainer>
            </div>
            <Divider
              orientation='vertical'
              className='absolute right-[-24px] top-0 h-full'
            />
          </div>

          <div className='relative h-full'>
            <div className='flex h-full justify-between gap-6'>
              <StartRunForm />
            </div>
            <Divider
              orientation='vertical'
              className='absolute right-[-24px] top-0 h-full'
            />
          </div>

          {/* ALIVE RUNS */}
          <div className='relative h-full'>
            <div className='flex h-full flex-col gap-3'>
              <ScrolledContainer className='h-0 flex-grow'>
                {aliveRuns.map((r) => {
                  const parentBuild = builds.find((b) => b.id === r.build_id)
                  if (!parentBuild) return null
                  const {
                    preset: { messenger: buildMessenger, preset: buildPreset },
                  } = parentBuild
                  return (
                    <Accordion
                      key={r.id}
                      isLoading={
                        r.status === 'running' ||
                        r.id === startingRunId ||
                        stoppingRunIds.includes(r.id)
                      }
                      data-testid={
                        r.status === 'alive' ? 'alive-run' : 'starting-run'
                      }
                      title={r.preset.name}
                      infoBlock={
                        <Tooltip
                          classNames={{
                            content: [
                              'h-8 px-3 shadow-lg rounded-[6px] bg-background border border-border text-[10px]',
                            ],
                          }}
                          content='Stop running'
                          placement='bottom'
                          offset={4}
                        >
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              runStop(r.id)
                            }}
                            disabled={stoppingRunIds.includes(r.id)}
                            className='flex h-6 w-6 items-center justify-center fill-input-border stroke-none hover:fill-text-secondary active:scale-95'
                          >
                            <SquareIcon className='size-[18px] fill-inherit stroke-inherit' />
                          </button>
                        </Tooltip>
                      }
                    >
                      <StringItem content={['Build: ', r.preset.build_name]} />
                      <StringItem
                        content={['Messenger: ', messengerMap[buildMessenger]]}
                      />
                      {r.preset.tg_bot_token && (
                        <StringItem
                          content={['Token: ', r.preset.tg_bot_token]}
                        />
                      )}
                      <StringItem content={['Build preset: ', buildPreset]} />
                      <StringItem content={['Run preset: ', r.preset.preset]} />
                      <StringItem
                        content={['Date: ', formatTimestamp(r.timestamp)]}
                      />
                    </Accordion>
                  )
                })}
              </ScrolledContainer>
              <Button
                isDisabled={runStopping || !aliveRuns.length}
                onClick={handleStopRuns}
                className='flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-btn-accent'
              >
                {runStopping && (
                  <div className='absolute inset-0 z-0 h-full w-full animate-fill-progress bg-input-border opacity-50'></div>
                )}
                <SquareIcon className='size-[18px] fill-text stroke-none' />
                <span className='text-sm font-semibold text-foreground'>
                  Stop all
                </span>
              </Button>
            </div>
            <Divider
              orientation='vertical'
              className='absolute right-[-24px] top-0 h-full'
            />
          </div>

          {/* PREVIOUS RUNS */}
          <div className='grid h-full grid-cols-1 grid-rows-2 gap-6'>
            <ScrolledContainer className='relative'>
              {previousRuns.map((r) => {
                const parentBuild = builds.find((b) => b.id === r.build_id)
                if (!parentBuild) return null
                const {
                  preset: { messenger: buildMessenger, preset: buildPreset },
                } = parentBuild
                return (
                  <Accordion
                    key={r.id}
                    title={r.preset.name}
                    infoBlock={
                      <div className='flex items-center gap-1 overflow-hidden'>
                        <span className='truncate text-input-border sm:text-xs md:text-sm'>
                          {formatRelativeTime(r.timestamp)}
                        </span>
                      </div>
                    }
                  >
                    <StringItem content={['Build: ', r.preset.build_name]} />
                    <StringItem
                      content={['Messenger: ', messengerMap[buildMessenger]]}
                    />
                    {r.preset.tg_bot_token && (
                      <StringItem
                        content={['Token: ', r.preset.tg_bot_token]}
                      />
                    )}
                    <StringItem content={['Build preset: ', buildPreset]} />
                    <StringItem content={['Run preset: ', r.preset.preset]} />
                    <StringItem
                      content={['Date: ', formatTimestamp(r.timestamp)]}
                    />
                  </Accordion>
                )
              })}
              <Divider
                orientation='horizontal'
                className='absolute bottom-[-12px] w-full'
              />
            </ScrolledContainer>

            {/* FAILED RUNS*/}
            <div className='flex flex-col'>
              <h4 className='mb-3 text-base font-semibold'>Failed runs</h4>
              <ScrolledContainer className='h-0 flex-grow'>
                {failedRuns.map((r) => {
                  const parentBuild = builds.find((b) => b.id === r.build_id)
                  if (!parentBuild) return null
                  const {
                    preset: { messenger: buildMessenger, preset: buildPreset },
                  } = parentBuild
                  return (
                    <Accordion
                      key={r.id}
                      title={r.preset.name}
                      infoBlock={
                        <div className='flex items-center gap-1 overflow-hidden'>
                          <span className='truncate text-input-border sm:text-xs md:text-sm'>
                            {formatRelativeTime(r.timestamp)}
                          </span>

                          <button
                            onClick={async (e: React.MouseEvent) => {
                              e.stopPropagation()
                              await runStart(String(r.build_id), {
                                end_status: 'success',
                                preset: r.preset.preset,
                                name: `Run ${runs.length}`,
                                build_name: r.preset.build_name,
                                tg_bot_token: r.preset.tg_bot_token,
                              })
                            }}
                            className='flex h-6 w-6 items-center justify-center hover:scale-105 active:scale-95'
                          >
                            <RefreshCw className='size-4 flex-shrink-0 stroke-foreground' />
                          </button>
                        </div>
                      }
                    >
                      <StringItem content={['Build: ', r.preset.build_name]} />
                      <StringItem
                        content={['Messenger: ', messengerMap[buildMessenger]]}
                      />
                      {r.preset.tg_bot_token && (
                        <StringItem
                          content={['Token: ', r.preset.tg_bot_token]}
                        />
                      )}
                      <StringItem content={['Build preset: ', buildPreset]} />
                      <StringItem content={['Run preset: ', r.preset.preset]} />
                      <StringItem
                        content={['Date: ', formatTimestamp(r.timestamp)]}
                      />
                    </Accordion>
                  )
                })}
              </ScrolledContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildManagerPage
