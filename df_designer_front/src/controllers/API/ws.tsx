import { useContext } from "react"
import { buildContext } from "../../contexts/buildContext"


export const statusSocketHandler = () => {
  const statusSocket = new WebSocket('ws://127.0.0.1:8000/socket')
    statusSocket.close()
    statusSocket.send('open connection')
    statusSocket.onopen = (e) => {
      console.log(e)
      alert('opened')
    }
    
    statusSocket.onclose = (e) => {
      console.log(e)
      alert('closed')
    }
}


