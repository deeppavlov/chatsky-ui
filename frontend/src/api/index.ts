import axios from "axios";
import { DEV, VITE_BASE_API_URL } from "../env.consts";

// const baseURL = VITE_BASE_API_URL ?? "http://localhost:8000/api/v1"
const baseURL = DEV ? VITE_BASE_API_URL : window.location.href.replace(window.location.pathname, '/api/v1')

export const $v1 = axios.create({
  baseURL: baseURL
})