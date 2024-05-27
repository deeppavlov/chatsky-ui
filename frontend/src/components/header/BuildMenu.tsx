import { Button, Spinner } from "@nextui-org/react"
import classNames from "classnames"
import { ChevronLeft, Wrench } from "lucide-react"
import { useContext, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { buildContext } from "../../contexts/buildContext"
import { chatContext } from "../../contexts/chatContext"
import { runContext } from "../../contexts/runContext"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import MonitorIcon from "../../icons/buildmenu/MonitorIcon"
import PlayIcon from "../../icons/buildmenu/PlayIcon"
import StopIcon from "../../icons/buildmenu/StopIcon"
import { parseSearchParams } from "../../utils"

const BuildMenu = () => {
  const { buildStart, buildPending, buildStatus, setLogsPage, logsPage } = useContext(buildContext)
  const { chat, setChat } = useContext(chatContext)
  const { runStart, runPending, runStatus, runStop, run } = useContext(runContext)
  const [showBuildMenu, setShowBuildMenu] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className={classNames("build-menu", !showBuildMenu && "build-menu-closed")}>
      <Button
        data-testid='build-menu-open-btn'
        isIconOnly
        className={
          "bg-transparent border border-transparent hover:bg-header-btn-hover hover:border-border-darker rounded p-0 max-w-5 w-5 min-w-5 h-[34px]"
        }
        onClick={() => setShowBuildMenu(!showBuildMenu)}>
        <ChevronLeft
          className={classNames("transition-all duration-300", showBuildMenu && "rotate-180")}
        />
      </Button>
      <Button
        data-testid='run-btn'
        isIconOnly
        style={{}}
        onClick={() => {
          if (runStatus !== "alive") {
            runStart({ end_status: "success", wait_time: 0 })
          } else if (runStatus === "alive" && run) {
            runStop(run?.id)
          }
        }}
        isLoading={runPending}
        spinner={
          <Spinner
            color='danger'
            size='sm'
          />
        }
        className={classNames(
          "flex items-center justify-center build-menu-item",
          !showBuildMenu && "build-menu-item-disabled"
        )}>
        {runStatus !== "alive" ? (
          <PlayIcon className='w-[18px] h-[18px]' />
        ) : (
          <StopIcon className='w-4 h-4' />
        )}
        <span
          className={classNames(
            "builded-check z-10 transition-all duration-300",
            runStatus === "alive"
              ? "bg-emerald-500"
              : runStatus === "stopped"
                ? "bg-transparent"
                : "bg-red-500",
            runPending && "bg-warning"
          )}
        />
      </Button>
      <Button
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
      </Button>
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
          "flex items-center justify-center build-menu-item",
          !showBuildMenu && "build-menu-item-disabled",
          chat && "build-menu-item-active"
        )}>
        <ChatIcon className='w-5 h-5' />
      </Button>
      <Button
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
      </Button>
    </div>
  )
}

export default BuildMenu
