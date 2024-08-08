import { $v1 } from "."

export const get_condition_methods = async () => {
  return (await $v1.get("/services/get_conditions")).data
}

export const lint_service = async (text: string) => {
  return (await $v1.post(`/services/lint_snippet`, { code: text })).data
}
