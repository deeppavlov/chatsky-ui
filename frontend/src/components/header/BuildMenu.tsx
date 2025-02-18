import { Button, Tooltip } from "@nextui-org/react"
import classNames from "classnames"
import { useContext } from "react"
import { useSearchParams } from "react-router-dom"
import { chatContext } from "../../contexts/chatContext"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import { parseSearchParams } from "../../utils"

const BuildMenu = () => {
  const { chat, setChat } = useContext(chatContext)
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className='flex items-center justify-start gap-1.5'>
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
      <Tooltip content='Open the chat window' radius='sm'>
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
          )}
        >
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
