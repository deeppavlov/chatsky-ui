import { Accordion, AccordionItem, Divider, Spinner } from "@nextui-org/react"
import { CheckCircle2, CircleSlash, Slash, X } from "lucide-react"
import { memo, useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { localBuildType, localRunType } from "../api/bot"
import { buildContext } from "../contexts/buildContext"
import { runContext } from "../contexts/runContext"
import { parseSearchParams } from "../utils"

const Logs = memo(() => {
  const { builds, logsPage } = useContext(buildContext)
  const { runs } = useContext(runContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentItem, setCurrentItem] = useState<localBuildType | localRunType | null>(
    (searchParams.get("type") === "run"
      ? runs.find((run) => run.id === Number(searchParams.get("run_id")))
      : builds.find((build) => build.id === Number(searchParams.get("build_id")))) ?? null
  )

  useEffect(() => {
    if (searchParams.get("type") === "run") {
      setCurrentItem(runs.find((run) => run.id === Number(searchParams.get("run_id"))) ?? null)
    } else if (searchParams.get("type") === "build") {
      setCurrentItem(
        builds.find((build) => build.id === Number(searchParams.get("build_id"))) ?? null
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builds, runs])

  return (
    <div
      className='w-full h-full absolute transition-transform duration-300 bg-background pt-20 pb-6 px-8 grid grid-cols-6 gap-6'
      style={{
        transform: !logsPage ? `translateX(100%)` : "translateX(0%)",
      }}>
      <div>
        <h1 className='text-3xl mb-4'>Builds</h1>
        <div className='grid gap-2 overflow-y-scroll max-h-[600px]'>
          <Accordion
            showDivider={false}
            selectedKeys={
              currentItem
                ? currentItem.type === "build"
                  ? [currentItem.id.toString()]
                  : [
                      builds
                        .find((build) => build.runs.some((run) => run.id === currentItem.id))!
                        .id.toString(),
                    ]
                : []
            }
            className='w-full flex flex-col gap-2'
            itemClasses={{
              base: "w-full px-0 py-0",
              content: "w-full pl-4 py-0 ",
              trigger: "w-full px-2 py-1 rounded-lg border border-border",
            }}>
            {builds && builds.length ? (
              builds
                .sort((a, b) => b.id - a.id)
                .map((build) => (
                  <AccordionItem
                    textValue='TEST'
                    key={build.id}
                    className=''
                    onPress={() => {
                      setCurrentItem(build)
                      setSearchParams({
                        ...parseSearchParams(searchParams),
                        build_id: build.id.toString(),
                        type: "build",
                      })
                    }}
                    title={
                      <div className='flex items-center justify-between w-full'>
                        <p>Build {build.id}</p>
                        <span className='flex items-center'>
                          {build.status === "completed" && (
                            <CheckCircle2
                              fill='var(--status-green)'
                              stroke='white'
                            />
                          )}{" "}
                          {build.status === "running" && (
                            <Spinner
                              size='sm'
                              color='warning'
                            />
                          )}
                          {build.status === "failed" && <X color='red' />}
                        </span>
                      </div>
                    }>
                    <div className='grid gap-2 mt-2'>
                      {build.runs &&
                        build.runs.length &&
                        build.runs
                          .sort((a, b) => b.id - a.id)
                          .map((r) => {
                            return (
                              <div
                                key={r.id}
                                onClick={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSearchParams({
                                    ...parseSearchParams(searchParams),
                                    run_id: r.toString(),
                                    build_id: build.id.toString(),
                                    type: "run",
                                  })
                                  setCurrentItem({ ...r, type: "run" })
                                }}
                                className='flex items-center justify-between border border-border rounded-lg px-2 py-0.5 cursor-pointer'>
                                <p>Run {r.id}</p>
                                <span className='flex items-center'>
                                  {r.status === "completed" && (
                                    <CheckCircle2
                                      fill='var(--status-green)'
                                      stroke='white'
                                    />
                                  )}{" "}
                                  {r.status === "running" && (
                                    <Spinner
                                      size='sm'
                                      color='danger'
                                    />
                                  )}
                                  {r.status === "failed" && <X color='red' />}
                                  {r.status === "stopped" && (
                                    <Slash
                                      className='scale-50'
                                      strokeWidth={4}
                                    />
                                  )}
                                </span>
                              </div>
                            )
                          })}
                    </div>
                  </AccordionItem>
                ))
            ) : (
              <AccordionItem textValue='TEST'>No builds found</AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
      <div className='col-span-4 flex items-start gap-10'>
        <Divider orientation='vertical' />
        <div className='flex flex-col items-start justify-start gap-2'>
          {currentItem && (
            <>
              {currentItem.type === "build" ? (
                <div>
                  <h4 className='text-xl font-semibold flex items-center gap-1 my-4'>
                    <span className='flex items-center'>
                      {currentItem.status === "completed" && (
                        <CheckCircle2
                          fill='var(--status-green)'
                          stroke='white'
                        />
                      )}
                      {currentItem.status === "running" && (
                        <Spinner
                          size='sm'
                          color='warning'
                        />
                      )}
                      {currentItem.status === "failed" && <X />}
                    </span>
                    Build {currentItem.id}
                  </h4>
                  <div>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Status:</span>
                      <span
                        style={{
                          color:
                            currentItem.status === "completed"
                              ? "var(--status-green)"
                              : "var(--status-red)",
                        }}>
                        {currentItem.status}
                      </span>
                    </p>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Timestamp:</span>
                      {currentItem.timestamp}
                    </p>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Preset name:</span>
                      {currentItem.preset_end_status}
                    </p>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Logs file path:</span>
                      <a
                        download
                        href={`../../../backend/df_designer/${currentItem.log_path}`}
                        className='text-blue-500 underline'>
                        {currentItem.log_path}
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className='text-xl font-semibold flex items-center gap-1 my-4'>
                    <span className='flex items-center'>
                      {currentItem.status === "completed" && (
                        <CheckCircle2
                          fill='var(--status-green)'
                          stroke='white'
                        />
                      )}
                      {currentItem.status === "running" && (
                        <Spinner
                          size='sm'
                          color='danger'
                        />
                      )}
                      {currentItem.status === "failed" && <X color='red' />}
                      {currentItem.status === "stopped" && <CircleSlash />}
                    </span>
                    Run {currentItem.id}
                  </h4>
                  <div>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Status:</span>
                      <span
                        style={{
                          color:
                            currentItem.status === "completed"
                              ? "var(--status-green)"
                              : currentItem.status === "stopped"
                                ? "var(--foreground)"
                                : "var(--status-red)",
                        }}>
                        {currentItem.status}
                      </span>
                    </p>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Timestamp:</span>
                      {currentItem.timestamp}
                    </p>
                    <p>
                      <span className='font-medium text-neutral-500 mr-1'>Logs file path:</span>
                      <a
                        download
                        href={`../../../backend/df_designer/${currentItem.log_path}`}
                        className='text-blue-500 underline'>
                        {currentItem.log_path}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* <div>
        <h1 className='text-3xl mb-4'>Runs</h1>
        <div className='grid gap-2 overflow-y-scroll max-h-[600px]'>
          {runs && runs.length ? (
            runs
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((build) => (
                <div key={build.id} className='px-2 py-1 flex h-9 items-center justify-between'>
                  <p>Run {build.id}</p>
                  <span className="flex items-center">
                    {build.status === "completed" && <CheckCircle2 fill="var(--status-green)" stroke="white" />}{" "}
                    {build.status === "running" && <Spinner size="sm" color='danger' />}
                    {build.status === "failed" && <X color="red" />}
                  </span>
                </div>
              ))
          ) : (
            <p>No runs found</p>
          )}
        </div>
      </div> */}
    </div>
  )
})

export default Logs
