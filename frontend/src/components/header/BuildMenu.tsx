import { flowContext } from "@/contexts/flowContext"
import Loader from "@/UI/Loader/Loader"
import { Button, Tooltip } from "@nextui-org/react"
import classNames from "classnames"
import { useContext } from "react"
import { useSearchParams } from "react-router-dom"
import { buildContext } from "../../contexts/buildContext"
import { chatContext } from "../../contexts/chatContext"
import { runContext } from "../../contexts/runContext"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import PlayIcon from "../../icons/buildmenu/PlayIcon"
import StopIcon from "../../icons/buildmenu/StopIcon"
import { parseSearchParams } from "../../utils"

const BuildMenu = () => {
  const { saveFlows, flows } = useContext(flowContext)
  const { buildStart, buildPending, buildStatus, setBuildStatus, buildStop } =
    useContext(buildContext)
  const { chat, setChat } = useContext(chatContext)
  const { runStart, runPending, runStatus, runStop, run, setRunStatus } = useContext(runContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const buttonClickHandler = async () => {
    if (runStatus !== "alive" && runStatus !== "running") {
      saveFlows(flows, { interface: "ui" })
      setRunStatus(() => "running")
      await buildStart({ wait_time: 1, end_status: "success" })
      await runStart({ end_status: "success", wait_time: 0 })
    } else if ((runStatus === "alive" || runStatus === "running") && run) {
      runStop(run?.id)
    } else if (buildStatus === "running") {
      buildStop()
    }
  }

  return (
    <div className='flex items-center justify-start gap-1.5'>
      <Tooltip
        content='Start build and run script process'
        radius='sm'>
        <button
          data-testid='run-btn'
          onClick={buttonClickHandler}
          className={classNames(
            "relative flex items-center justify-center bg-background hover:bg-overlay border border-border rounded-small w-10 h-10 transition-colors",
            runStatus === "alive"
              ? "border-emerald-500"
              : runStatus === "stopped"
                ? "border-border"
                : runStatus === "running"
                  ? "border-amber-600"
                  : "border-red-500"
          )}>
          {(runPending || buildPending) && (
            <div className='absolute bg-background rounded-full -bottom-1.5 -right-1.5 w-5 h-5 transition animate-fade-in'>
              <Loader className='!border-danger border-2 !w-4 !h-4' />
            </div>
          )}
          {runStatus === "alive" || runStatus === "running" ? (
            <StopIcon className='w-4 h-4' />
          ) : (
            <PlayIcon className='w-[18px] h-[18px]' />
          )}
          {/* <span
          className={classNames(
            "builded-check z-10 transition-all duration-300",
            runStatus === "alive"
              ? "bg-emerald-500"
              : runStatus === "stopped"
                ? "bg-transparent"
                : "bg-red-500",
            runPending && "bg-warning"
          )}
        /> */}
        </button>
      </Tooltip>
      {/* <Button
        data-testid='build-btn'
        isIconOnly
        spinner={
          <Spinner
            color='warning'
            size='sm'
          />
        }
        style={{}}
        onClick={() => buildStart({ wait_time: 1, end_status: "success" })}
        isLoading={buildPending}
        className={classNames("flex items-center justify-center build-menu-item")}>
        <Wrench className='w-5 h-5' />
        <span
          className={classNames(
            "builded-check z-10 transition-all duration-300",
            buildStatus === "completed"
              ? "bg-emerald-500"
              : buildStatus === "stopped"
                ? "bg-transparent"
                : "bg-red-500",
            buildPending && "bg-warning"
          )}
        />
      </Button> */}
      <Tooltip
        content='Open the chat window'
        radius='sm'>
        <Button
          data-testid='chat-btn'
          onClick={() => {
            setSearchParams({
              ...parseSearchParams(searchParams),
              chat: !chat ? "opened" : "closed",
            })
            setChat(!chat)
          }}
          isIconOnly
          style={{}}
          className={classNames(
            "bg-background hover:bg-overlay border border-border rounded-small",
            chat ? "bg-overlay border-border-darker" : ""
          )}>
          <ChatIcon className='w-5 h-5' />
        </Button>
      </Tooltip>
      {/* <Button
        isIconOnly
        style={{}}
        onClick={() => {
          setSearchParams({
            ...parseSearchParams(searchParams),
            logs_page: !logsPage ? "opened" : "closed",
          })
          setLogsPage(!logsPage)
        }}
        className={classNames(
          "flex items-center justify-center build-menu-item",
          !showBuildMenu && "build-menu-item-disabled",
          logsPage && "build-menu-item-active"
        )}>
        <MonitorIcon className='w-5 h-5' />
      </Button> */}
    </div>
  )
}

export default BuildMenu
