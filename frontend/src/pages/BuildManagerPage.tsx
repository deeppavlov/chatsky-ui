import { checkBuildIsChanged } from "@/api/bot"
import Accordion, { StringItem } from "@/components/deliver/Accordion"
import BuildForm from "@/components/deliver/BuildForm"
import StartRunForm from "@/components/deliver/StartRunForm"
import { buildContext } from "@/contexts/buildContext"
import { flowContext } from "@/contexts/flowContext"
import { PopUpContext } from "@/contexts/popUpContext"
import { runContext } from "@/contexts/runContext"
import { workspaceContext } from "@/contexts/workspaceContext"
import Tools from "@/icons/Tools"
import RebuildModal from "@/modals/RebuildModal/RebuildModal"
import RestoreBuildModal from "@/modals/RestoreBuildModal/RestoreBuildModal"
import ScrolledContainer from "@/UI/ScrolledContainer/ScrolledContainer"
import { formatRelativeTime, formatTimestamp } from "@/utils"
import { Button, Divider } from "@nextui-org/react"
import { RefreshCw, SquareArrowOutUpRight, SquareIcon, X } from "lucide-react"
import { useContext, useState } from "react"
import CheckIcon from "@/icons/CheckIcon"
import MicroscopeIcon from "@/icons/MicroscopeIcon"

const BuildManagerPage = () => {
  const { currentPage } = useContext(workspaceContext)
  const { saveFlows, flows } = useContext(flowContext)
  const { buildStart, buildPending, builds, buildStop } = useContext(buildContext)
  const { getFlows } = useContext(flowContext)
  const {
    runStart,
    runStop,
    stopAllRuns,
    startingRunId,
    runStopping,
    runs: reversedRuns,
  } = useContext(runContext)
  const { openPopUp } = useContext(PopUpContext)
  const runs = [...reversedRuns].reverse()

  const aliveRuns = runs.filter((r) => r.status === "alive" || r.status === "running")
  const previousRuns = runs.filter(
    (r) => r.status !== "failed" && r.status !== "alive" && r.status !== "running"
  )
  const failedRuns = runs.filter((r) => r.status === "failed")

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
      "restoreBuild"
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
            end_status: "success",
            messenger: "web",
            preset: "None",
            name: newBuildName,
          })

          if (status === "completed") {
            await runStart(String(build_id), {
              end_status: "success",
              preset: "None",
              name: newRunName,
              build_name: newBuildName,
            })
          }
          setLoading(false)
        }}
      />,
      "rebuild"
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
      end_status: "success",
      messenger: "web",
      preset: "None",
      name: newBuildName,
    })

    if (status === "completed") {
      await runStart(String(build_id), {
        end_status: "success",
        preset: "None",
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
        transform: currentPage === "deliver" ? "translateX(0)" : "translateX(100%)",
      }}
      className='absolute top-0 left-0 transition-all duration-300 pt-24 pb-12 px-10 w-screen h-screen bg-background flex flex-col'
    >
      {/* HEADER */}
      <div className='w-full flex justify-between align-middle mb-4 px-3'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl font-semibold'>Deliver</h2>
          <Button
            disableRipple
            disabled={startingRunId !== null || buildPending}
            className='bg-foreground text-background rounded-lg'
            onClick={buildAndRunHandler}
          >
            {/* АНИМАЦИЯ */}
            {loading && (
              <div className='absolute inset-0 bg-background w-full h-full animate-fill-progress opacity-50 z-0'></div>
            )}
            <Tools className='z-10' />
            <span className='z-10 text-background'>Quick build and run</span>
          </Button>
        </div>
        <Button className='bg-btn-accent rounded-lg flex-shrink-0 flex justify-center items-center gap-2'>
          <MicroscopeIcon />
          <span className='text-sm font-semibold'>Test panel</span>
        </Button>
      </div>

      {/* SUBHEADER */}
      <div className='flex flex-col gap-4 align-middle h-0 flex-grow'>
        <div className='grid grid-cols-5 w-full gap-12 flex-grow-0 px-3'>
          <h3 className='text-lg font-semibold'>New build</h3>
          <h3 className='text-lg font-semibold'>Existing builds</h3>
          <h3 className='text-lg font-semibold'>New run</h3>
          <h3 className='text-lg font-semibold'>Running</h3>
          <h3 className='text-lg font-semibold'>Previous runs</h3>
        </div>

        <div className='grid grid-cols-5 grid-rows-1 h-0 flex-grow gap-12 pb-8 px-3'>
          <div className='h-full relative'>
            <div className='flex flex-col gap-4 h-full w-full bg'>
              <BuildForm />
            </div>
            <Divider orientation='vertical' className='h-full absolute right-[-24px] top-0' />
          </div>

          {/* EXISTING BUILDS */}
          <div className='relative h-full'>
            <div className='flex justify-between h-full gap-6'>
              <ScrolledContainer>
                {builds.map((b) => {
                  const relativeBuildTime = formatRelativeTime(b.timestamp)
                  return (
                    <Accordion
                      isLoading={b.status === "running"}
                      key={b.id}
                      title={b.preset.name}
                      infoBlock={
                        <div className='flex gap-1 items-center overflow-hidden'>
                          <span className='text-input-border md:text-sm sm:text-xs truncate'>
                            {relativeBuildTime}
                          </span>
                          {b.status === "failed" && (
                            <X strokeWidth={3.5} className='flex-shrink-0 size-3.5 stroke-danger' />
                          )}

                          {b.status === "completed" && (
                            <>
                              <CheckIcon className='flex-shrink-0' />
                              <button
                                onClick={handleRestoreBuild(b.id)}
                                className='h-6 w-6 flex justify-center items-center active:scale-95 hover:scale-105'
                              >
                                <SquareArrowOutUpRight className='stroke-foreground size-4' />
                              </button>
                            </>
                          )}
                          {b.status === "running" && (
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                buildStop(b.id)
                              }}
                              className='h-6 w-6 flex justify-center items-center active:scale-95 hover:scale-105'
                            >
                              <SquareIcon className='size-4 stroke-foreground' />
                            </button>
                          )}
                        </div>
                      }
                    >
                      <StringItem content={["Messenger: ", b.preset.messenger]} />
                      <StringItem content={["Preset: ", b.preset.preset]} />
                      <StringItem content={["Date: ", formatTimestamp(b.timestamp)]} />
                      <StringItem content={["Status: ", b.status]} />
                    </Accordion>
                  )
                })}
              </ScrolledContainer>
            </div>
            <Divider orientation='vertical' className='h-full absolute right-[-24px] top-0' />
          </div>

          <div className='h-full relative'>
            <div className='flex justify-between h-full gap-6'>
              <StartRunForm />
            </div>
            <Divider orientation='vertical' className='h-full absolute right-[-24px] top-0' />
          </div>

          {/* ALIVE RUNS */}
          <div className='h-full relative'>
            <div className=' flex flex-col h-full gap-3'>
              <ScrolledContainer className='flex-grow h-0'>
                {aliveRuns.map((r) => {
                  const parentBuild = builds.find((b) => b.id === r.build_id)
                  if (!parentBuild) return null
                  const {
                    preset: { messenger: buildMessenger, preset: buildPreset },
                  } = parentBuild
                  return (
                    <Accordion
                      key={r.id}
                      isLoading={r.status === "running" || r.id === startingRunId}
                      title={r.preset.name}
                      infoBlock={
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            runStop(r.id)
                          }}
                          className='h-6 w-6 flex justify-center items-center active:scale-95 hover:scale-105'
                        >
                          <SquareIcon className='size-4 stroke-foreground' />
                        </button>
                      }
                    >
                      <StringItem content={["Build: ", r.preset.build_name]} />
                      <StringItem content={["Messenger: ", buildMessenger]} />
                      <StringItem content={["Build preset: ", buildPreset]} />
                      <StringItem content={["Run preset: ", r.preset.preset]} />
                      <StringItem content={["Date: ", formatTimestamp(r.timestamp)]} />
                    </Accordion>
                  )
                })}
              </ScrolledContainer>
              <Button
                isDisabled={runStopping || !aliveRuns.length}
                onClick={handleStopRuns}
                className='bg-btn-accent rounded-lg w-full flex-shrink-0 flex justify-center items-center gap-2'
              >
                <SquareIcon className='size-4 stroke-foreground' />
                <span className='text-sm text-foreground font-semibold'>Stop all</span>
              </Button>
            </div>
            <Divider orientation='vertical' className='h-full absolute right-[-24px] top-0' />
          </div>

          {/* PREVIOUS RUNS */}
          <div className='h-full grid grid-cols-1 grid-rows-2 gap-6'>
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
                    isLoading={false}
                    title={r.preset.name}
                    infoBlock={
                      <div className='flex gap-1 items-center overflow-hidden'>
                        <span className='text-input-border md:text-sm sm:text-xs truncate'>
                          {formatRelativeTime(r.timestamp)}
                        </span>
                      </div>
                    }
                  >
                    <StringItem content={["Build: ", r.preset.build_name]} />
                    <StringItem content={["Messenger: ", buildMessenger]} />
                    <StringItem content={["Build preset: ", buildPreset]} />
                    <StringItem content={["Run preset: ", r.preset.preset]} />
                    <StringItem content={["Date: ", formatTimestamp(r.timestamp)]} />
                  </Accordion>
                )
              })}
              <Divider orientation='horizontal' className='w-full absolute bottom-[-12px]' />
            </ScrolledContainer>

            {/* FAILED RUNS*/}
            <div className='flex flex-col'>
              <h4 className='text-base font-semibold mb-3'>Failed runs</h4>
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
                        <div className='flex gap-1 items-center overflow-hidden'>
                          <span className='text-input-border md:text-sm sm:text-xs truncate'>
                            {formatRelativeTime(r.timestamp)}
                          </span>

                          <button
                            onClick={async (e: React.MouseEvent) => {
                              e.stopPropagation()
                              await runStart(String(r.build_id), {
                                end_status: "success",
                                preset: r.preset.preset,
                                name: `Run ${runs.length}`,
                                build_name: r.preset.build_name,
                                tg_bot_token: r.preset.tg_bot_token,
                              })
                            }}
                            className='h-6 w-6 flex justify-center items-center active:scale-95 hover:scale-105'
                          >
                            <RefreshCw className='size-4 flex-shrink-0 stroke-foreground' />
                          </button>
                        </div>
                      }
                    >
                      <StringItem content={["Build: ", r.preset.build_name]} />
                      <StringItem content={["Messenger: ", buildMessenger]} />
                      <StringItem content={["Build preset: ", buildPreset]} />
                      <StringItem content={["Run preset: ", r.preset.preset]} />
                      <StringItem content={["Date: ", formatTimestamp(r.timestamp)]} />
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
