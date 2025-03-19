import classNames from 'classnames'
import {
  AlertOctagon,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { createContext } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

export type notificationTypeType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'debug'

export type notificationType = {
  title: string
  message: string
  type: notificationTypeType
  duration: number
  timestamp: number
  stack: number
  isRead: boolean
  link?: { text: string; url: string }
}

export type createNotificationType = {
  title: string
  message: string
  type?: 'success' | 'warning' | 'error' | 'info' | 'debug'
  duration?: number
  timestamp?: number
  stack?: number
  link?: { text: string; url: string }
}

type notificationsContextType = {
  notifications: notificationType[]
  notification: {
    add: (notification: createNotificationType) => void
    delete: (timestamp: number) => void
    clear: () => void
    set: React.Dispatch<React.SetStateAction<notificationType[]>>
  }
  popupsDisabled: boolean
  setPopupsDisabled: React.Dispatch<React.SetStateAction<boolean>>
}

export const NotificationsContext = createContext<notificationsContextType>({
  notifications: [],
  notification: {
    add: () => {},
    delete: () => {},
    clear: () => {},
    set: () => {},
  },
  popupsDisabled: false,
  setPopupsDisabled: () => {},
})

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useLocalStorage<notificationType[]>(
    'notifications',
    [],
  )
  const [popupsDisabled, setPopupsDisabled] = useLocalStorage(
    'popupsDisabled',
    false,
  )

  /**
   * This function returns notification toast classNames by notification type
   * @param type notification type
   * @returns notification toast classNames
   */
  const notificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-[#ebf9f5] border-green-500'
      case 'warning':
        return 'bg-[#fff5ea] border-yellow-500'
      case 'error':
        return 'bg-[#ffebeb] border-red-500'
      case 'info':
        return 'bg-[#ebf4fa] border-blue-500'
      case 'debug':
        return 'bg-[#f5f5f5] border-neutral-500'
    }
  }

  /**
   * This function returns notification header text color by notification type
   * @param type notification type
   * @returns notification header text color
   */
  const notificationHeaderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-black'
      case 'warning':
        return 'text-black'
      case 'error':
        return 'text-[#B20000]'
      case 'info':
        return 'text-black'
      case 'debug':
        return 'text-neutral-500'
    }
  }

  /**
   * This functions returns icon by notification type
   * @param type notification type
   * @returns icon by notification type
   */
  const notificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className='stroke-green-500' />
      case 'warning':
        return <AlertTriangle className='stroke-yellow-500' />
      case 'error':
        return <AlertOctagon className='stroke-[#B20000]' />
      case 'info':
        return <Info className='stroke-blue-500' />
      case 'debug':
        return <Bug className='stroke-neutral-500' />
    }
  }

  /**
   * Create new notification function
   * @param {createNotificationType} notification_object message, title, type, duration, timestamp, stack of notifications
   * Calls new notification
   */
  const addNotification = ({
    message,
    title,
    type = 'info',
    duration = 5000,
    timestamp = Date.now(),
    stack = 1,
    link,
  }: createNotificationType) => {
    console.log(link)

    const color = notificationTypeColor(type)
    const notification = {
      title,
      message,
      type,
      timestamp,
      stack,
      duration,
      isRead: false,
      link,
    }
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      notification,
    ])
    !popupsDisabled &&
      toast.custom(
        (t) => (
          <div
            className={classNames(
              t.visible ? 'animate-appearance-in' : 'animate-appearance-out',
              'rounded-lg p-2',
              color,
              `pointer-events-auto z-50 flex w-max max-w-sm rounded-lg border`,
            )}
          >
            <div className='grid gap-1'>
              <div className='flex items-center justify-start gap-2'>
                {notificationTypeIcon(notification.type)}
                <h3
                  className={classNames(
                    'text-base font-medium',
                    notificationHeaderColor(notification.type),
                  )}
                >
                  {notification.title}
                </h3>
              </div>
              {notification.message && (
                <p className='whitespace-pre-wrap text-sm text-neutral-500'>
                  {notification.message}
                </p>
              )}
              {notification.link &&
                (typeof notification.link === 'object' &&
                'url' in notification.link ? (
                  <Link
                    to={{
                      pathname: location.pathname,
                      search: notification.link.url,
                    }}
                  >
                    <span className='cursor-pointer text-sm font-semibold text-condition-default'>
                      See logs for this
                    </span>
                  </Link>
                ) : (
                  notification.link
                ))}
            </div>
          </div>
        ),
        {
          id: message,
        },
      )
  }

  /**
   * Delete notification by timestamp (as id) function
   * @param {number} timestamp as notification id
   */
  const deleteNotification = (timestamp: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.timestamp !== timestamp,
      ),
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
    <NotificationsContext.Provider
      value={{
        notifications,
        notification,
        popupsDisabled,
        setPopupsDisabled,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export default NotificationsProvider
