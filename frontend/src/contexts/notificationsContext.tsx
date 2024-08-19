import classNames from "classnames"
import { AlertOctagon, AlertTriangle, Bug, CheckCircle2, Info } from "lucide-react"
import { createContext } from "react"
import toast from "react-hot-toast"
import useLocalStorage from "../hooks/useLocalStorage"

export type notificationTypeType = "success" | "warning" | "error" | "info" | "debug"

export type notificationType = {
  title: string
  message: string
  type: notificationTypeType
  duration: number
  timestamp: number
  stack: number
}

export type createNotificationType = {
  title: string
  message: string
  type?: "success" | "warning" | "error" | "info" | "debug"
  duration?: number
  timestamp?: number
  stack?: number
}

type notificationsContextType = {
  notifications: notificationType[]
  notification: {
    add: (notification: createNotificationType) => void
    delete: (timestamp: number) => void
    clear: () => void
    set: (notifications: notificationType[]) => void
  }
}

export const notificationsContext = createContext<notificationsContextType>({
  notifications: [],
  notification: {
    add: () => {},
    delete: () => {},
    clear: () => {},
    set: () => {},
  },
})

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useLocalStorage<notificationType[]>("notifications", [])

  const notificationTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[#ebf9f5] border-green-500"
      case "warning":
        return "bg-[#fff5ea] border-yellow-500"
      case "error":
        return "bg-[#ffebeb] border-red-500"
      case "info":
        return "bg-[#ebf4fa] border-blue-500"
      case "debug":
        return "bg-[#f5f5f5] border-neutral-500"
    }
  }

  const notificationHeaderColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-black"
      case "warning":
        return "text-black"
      case "error":
        return "text-[#B20000]"
      case "info":
        return "text-black"
      case "debug":
        return "text-neutral-500"
    }
  }
  const notificationTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className='stroke-green-500' />
      case "warning":
        return <AlertTriangle className='stroke-yellow-500' />
      case "error":
        return <AlertOctagon className='stroke-[#B20000]' />
      case "info":
        return <Info className='stroke-blue-500' />
      case "debug":
        return <Bug className='stroke-neutral-500' />
    }
  }

  const addNotification = ({
    message,
    title,
    type = "info",
    duration = 5000,
    timestamp = Date.now(),
    stack = 1,
  }: createNotificationType) => {
    const color = notificationTypeColor(type)
    const notification = { title, message, type, timestamp, stack, duration }
    setNotifications((prevNotifications) => [...prevNotifications, notification])
    toast.custom(
      (t) => (
        <div
          className={classNames(
            t.visible ? "animate-appearance-in" : "animate-appearance-out",
            "p-2 rounded-lg",
            color,
            `z-50 max-w-sm w-max rounded-lg pointer-events-auto flex border`
          )}>
          <div className='grid gap-1'>
            <div className='flex items-center justify-start gap-2'>
              {notificationTypeIcon(notification.type)}
              <h3
                className={classNames(
                  "text-base font-medium",
                  notificationHeaderColor(notification.type)
                )}>
                {notification.title}
              </h3>
            </div>
            {notification.message && (
              <p className='text-sm text-neutral-500'>{notification.message}</p>
            )}
          </div>
        </div>
      ),
      {
        id: message,
      }
    )
  }

  const deleteNotification = (timestamp: number) => {
    
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.timestamp !== timestamp)
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const notification = {
    add: addNotification,
    delete: deleteNotification,
    clear: clearNotifications,
    set: setNotifications,
  }

  return (
    <notificationsContext.Provider
      value={{
        notifications,
        notification,
      }}>
      {children}
    </notificationsContext.Provider>
  )
}

export default NotificationsProvider
