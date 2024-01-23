import axios, { AxiosResponse } from "axios"

type buildResponseType = {
  status: string
}

export const buildBotScript = async () => {
  try {
    const response: AxiosResponse = await axios.post('/build')
    const data: buildResponseType = response.data
    if (data.status !== 'ok') {
      throw Error('data.status is not ok')
    } else {
      return true
    }
  } catch (error) {
    throw error
  }
}