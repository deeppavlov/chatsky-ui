import { Button, Tab, Tabs, useDisclosure } from "@nextui-org/react"
import { BellRing, EditIcon, Rocket, Settings } from "lucide-react"
import React, { useContext } from "react"
import MonitorIcon from "../../icons/buildmenu/MonitorIcon"
import { Link, useSearchParams } from "react-router-dom"
import { buildContext } from "../../contexts/buildContext"
import { parseSearchParams } from "../../utils"
import LogsPageOpener from "./components/LogsPageOpener"
import SettingsPageOpener from "./components/SettingsPageOpener"
import { Logo } from "../../icons/Logo"
import LocalStogareIcon from "../../icons/footbar/LocalStogareIcon"
import LocalStorage from "../../modals/LocalStorage/LocalStorage"
import classNames from "classnames"

const FootBar = () => {
  const { setLogsPage, logsPage } = useContext(buildContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    isOpen: isLocalStogareOpen,
    onOpen: onLocalStogareOpen,
    onClose: onLocalStogareClose,
  } = useDisclosure()

  return (
    <div className='h-12 px-2 bg-overlay border-t border-border absolute bottom-0 w-screen flex items-center justify-between'>
      <div className='absolute w-full h-12 flex items-center justify-center'>
        <Tabs
          variant='light'
          className=''
          classNames={{
            cursor: "border border-foreground bg-background",
            tab: "w-32 h-9",
            panel: "p-0 m-0 w-0 h-0",
          }}>
          <Tab
            key={"Edit"}
            title={
              <span className='flex items-center gap-2'>
                <EditIcon />
                Edit
              </span>
            }></Tab>
          <Tab
            key={"Deliver"}
            isDisabled
            title={
              <span className='flex items-center gap-2'>
                <Rocket />
                Deliver
              </span>
            }></Tab>
          <Tab
            key={"Inspect"}
            title={
              <span className='flex items-center gap-2'>
                <MonitorIcon />
                Inspect
              </span>
            }>
            <LogsPageOpener />
          </Tab>
          <Tab
            key={"Settings"}
            title={
              <span className='flex items-center gap-2'>
                <Settings />
                Settings
              </span>
            }>
            <SettingsPageOpener />
          </Tab>
        </Tabs>
      </div>
      <Link to={"/app/home"} className='flex items-center gap-1 z-10 cursor-pointer'>
        <Logo />
        <div className="flex flex-col items-start justify-start gap-0">
          <span className='flex font-bold text-lg h-6'>DF Designer</span>
          <span className='flex font-bold text-sm'>v 0.1.0</span>
        </div>
      </Link>
      <div className='flex items-end gap-0.5'>
        <Button
          onClick={onLocalStogareOpen}
          className={classNames(
            "local-storage-button px-2 cursor-pointer rounded-small h-9 flex items-center bg-transparent justify-center gap-2 border border-transparent hover:bg-background hover:border-foreground hover:text-foreground",
            isLocalStogareOpen && "bg-background border-foreground"
          )}>
          <LocalStogareIcon className='local-storage-button-hover:stroke-0' />
          Local storage
        </Button>
        <Button
          isIconOnly
          className='rounded-small h-9 flex items-center bg-transparent justify-center border border-transparent hover:bg-background hover:border-foreground'>
          <BellRing className='w-5 h-5' />
        </Button>
      </div>
      <LocalStorage
        isOpen={isLocalStogareOpen}
        onClose={onLocalStogareClose}
      />
    </div>
  )
}

export default FootBar
