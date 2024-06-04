import axios from "axios";


export const $v1 = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL ?? "http://localhost:8000",
})