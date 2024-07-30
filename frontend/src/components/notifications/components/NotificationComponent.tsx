import { Button } from "@nextui-org/react"
import classNames from "classnames"
import { AlertCircle, AlertOctagon, Bug, CheckCircle2, Info, X } from "lucide-react"
import { useContext, useMemo, useState } from "react"
import { notificationType, notificationsContext } from "../../../contexts/notificationsContext"

const NotificationComponent = ({ notification }: { notification: notificationType }) => {
  const { notification: nt } = useContext(notificationsContext)
  const [isDelete, setIsDelete] = useState(false)

  const notificationTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#00CC991a]"
      case "warning":
        return "bg-[#FF95001A]"
      case "error":
        return "bg-[#FF33331A]"
      case "info":
        return "bg-[#3399CC1A]"
      case "debug":
        return "bg-[#9999991A]"
    }
  }

  const notificationColor = useMemo(
    () => notificationTypeColor(notification.type),
    [notification.type]
  )

  const notificationTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className='stroke-green-500' />
      case "warning":
        return <AlertCircle className='stroke-yellow-500' />
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
      nt.delete(notification.timestamp)
    }, 300)
  }

  return (
    <div
      key={notification.timestamp}
      className={classNames(
        "w-full flex items-center justify-between p-2 rounded-lg transition-all",
        notificationColor,
        isDelete && "opacity-0 -translate-x-full"
      )}>
      <div className='w-full'>
        <div className='flex items-center justify-between'>
          <div className="flex items-center justify-start gap-2">
            {notificationTypeIcon(notification.type)}
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
        {notification.message && <p className='text-xs'>{notification.message}</p>}
      </div>
    </div>
  )
}

export default NotificationComponent
