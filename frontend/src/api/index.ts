import axios from "axios"
import { DEV, VITE_BASE_API_URL } from "../env.consts"


const baseURL = DEV
  ? VITE_BASE_API_URL
  : window.location.protocol + "//" + window.location.host + "/api/v1"

console.log(baseURL)

export const $v1 = axios.create({
  baseURL: baseURL,
})
