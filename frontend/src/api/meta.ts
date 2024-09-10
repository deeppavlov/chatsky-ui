import { $v1 } from "."



export const get_config_version = async () => {
  return (await $v1.get("/config/version")).data
}