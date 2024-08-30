import { Button } from "@nextui-org/react"
import classNames from "classnames"
import { AlertOctagon, AlertTriangle, Bug, CheckCircle2, Info, X } from "lucide-react"
import { useContext, useMemo, useState } from "react"
import { NotificationsContext, notificationType } from "../../../contexts/notificationsContext"

type NotificationComponentType = {
  notification: notificationType & {
    stack: number
  }
}

const NotificationComponent = ({ notification }: NotificationComponentType) => {
  const { notification: nt, notifications } = useContext(NotificationsContext)
  const [isDelete, setIsDelete] = useState(false)

  const notificationTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return {
          body: "bg-[#00CC991a]",
          stack: "bg-[#00CC99]",
          stroke: "bg-[#00CC99]",
        }
      case "warning":
        return {
          body: "bg-[#FF95001A]",
          stack: "bg-[#FF9500]",
          stroke: "bg-[#FF9500]",
        }
      case "error":
        return {
          body: "bg-[#FF33331A]",
          stack: "bg-[#FF3333]",
          stroke: "bg-[#FF3333]",
        }
      case "info":
        return {
          body: "bg-[#3399CC1A]",
          stack: "bg-[#3399CC]",
          stroke: "bg-[#3399CC]",
        }
      case "debug":
        return {
          body: "bg-[#9999991A]",
          stack: "bg-[#999999]",
          stroke: "bg-[#999999]",
        }
    }
  }

  const notificationColor = useMemo(
    () => notificationTypeColor(notification.type)?.body,
    [notification.type]
  )

  const notificationStackColor = useMemo(
    () => notificationTypeColor(notification.type)?.stack,
    [notification.type]
  )

  const notificationTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className='stroke-green-500' />
      case "warning":
        return <AlertTriangle className='stroke-yellow-500' />
      case "error":
        return <AlertOctagon className='stroke-red-500' />
      case "info":
        return <Info className='stroke-blue-500' />
      case "debug":
        return <Bug />
    }
  }

  const deleteCurrentNotification = () => {
    setIsDelete(true)
    setTimeout(() => {
      if (notification.stack == 1) {
        nt.delete(notification.timestamp)
      }
      if (notification.stack > 1) {
        const index = notifications.findIndex((n) => n.timestamp == notification.timestamp)
        for (let i = 0; i <= index; i++) {
          console.log(notifications[i])
          if (notifications[i].stack === 0 && notifications[i].message === notification.message) {
            console.log("deletion")
            nt.delete(notifications[i].timestamp)
          }
        }
        nt.delete(notification.timestamp)
      }
    }, 300)
  }

  return (
    <div
      className='w-full relative'
      key={notification.timestamp}>
      <div
        className={classNames(
          "w-full flex items-center justify-between p-2 rounded-lg transition-all",
          notificationColor,
          isDelete && "opacity-0 -translate-x-full"
        )}>
        <div className='w-full relative'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-start gap-2'>
              {notification.stack <= 1 ? (
                notificationTypeIcon(notification.type)
              ) : (
                <span
                  className={classNames(
                    notificationStackColor,
                    "w-6 h-6 text-center rounded-full text-white"
                  )}>
                  {notification.stack}
                </span>
              )}
              <h1 className='text-sm font-medium'>{notification.title}</h1>
            </div>
            <Button
              onClick={deleteCurrentNotification}
              size='sm'
              isIconOnly
              variant='light'
              className='p-0.5 min-h-0 min-w-0 w-5 h-5'>
              <X className='w-4 h-4' />
            </Button>
          </div>
          {notification.message ? <p className='text-xs text-neutral-400 mt-1'>{notification.message}</p> : <p className="text-xs text-neutral-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  )
}

export default NotificationComponent
