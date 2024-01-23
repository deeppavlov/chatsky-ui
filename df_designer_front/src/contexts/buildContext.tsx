import { createContext, useEffect, useState } from "react";
import { chatMessageType } from "../components/newChatComponent";

type buildContextType = {
  logs: string[],
  setLogs: (newState: any) => void;
  builded: boolean;
  setBuilded: (newState: boolean) => void,
  connectionStatus: 'alive' | 'broken' | 'closed' | 'not open'
  setConnectionStatus: (newState: 'alive' | 'broken' | 'closed') => void
  logsPage: boolean
  setLogsPage: (newState: boolean) => void
  // statusSocketHandler: () => void
};

const initialValue: buildContextType = {
  logs: [],
  setLogs: () => { },
  builded: false,
  setBuilded: () => { },
  connectionStatus: 'not open',
  setConnectionStatus: () => { },
  logsPage: false,
  setLogsPage: () => { },
  // statusSocketHandler: () => { }
};

export const buildContext = createContext<buildContextType>(initialValue);

export function BuildProvider({ children }) {

  const [builded, setBuilded] = useState<boolean>()
  const [logsPage, setLogsPage] = useState<boolean>(false)
  const [logs, setLogs] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'alive' | 'broken' | 'closed' | 'not open'>('not open')

  // const statusSocketHandler = () => {
  //   const statusSocket = new WebSocket('ws://127.0.0.1:8000/socket')
  //     statusSocket.close()
  //     statusSocket.send('open connection')
  //     statusSocket.onopen = (e) => {
  //       console.log(e)
  //       alert('opened')
  //     }

  //     statusSocket.onmessage = (e) => {
  //       console.log(e)
  //       setLogs(e.data)
  //     }

  //     statusSocket.onclose = (e) => {
  //       console.log(e)
  //       alert('closed')
  //     }
  // }


  return (
    <buildContext.Provider
      value={{
        logs,
        setLogs,
        builded,
        setBuilded,
        connectionStatus,
        setConnectionStatus,
        logsPage,
        setLogsPage
        // statusSocketHandler
      }}
    >
      {children}
    </buildContext.Provider>
  );
}
