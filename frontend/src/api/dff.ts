import { $v1 } from '.';


export const get_condition_methods = async () => {
  return (await $v1.get("/services/get_conditions")).data
}