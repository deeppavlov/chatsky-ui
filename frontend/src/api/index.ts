import axios from "axios";
import { VITE_BASE_API_URL } from "../env.consts";

const baseURL = VITE_BASE_API_URL ?? "http://localhost:8000/api/v1"

export const $v1 = axios.create({
  baseURL: baseURL
})