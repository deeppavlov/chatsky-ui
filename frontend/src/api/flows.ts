import { interfaceType } from '@/contexts/flowContext'
import { $v1 } from '.'
import { FlowType } from '../types/FlowTypes'
import { ParsedSlot } from '../utils'
import { GetFlowsResponseType, SaveFlowsResponseType } from './flows.types'

export const get_flows = async (
  build_id?: number,
): Promise<GetFlowsResponseType> => {
  const url = build_id !== undefined ? `/flows/?build_id=${build_id}` : '/flows'
  return (await $v1.get(url)).data
}

export const save_flows = async (
  flows: FlowType[],
  slots?: Record<string, ParsedSlot> | null,
): Promise<SaveFlowsResponseType> => {
  // const hasValidSlots = slots && Object.values(slots).some(slot => Object.keys(slot).length > 0);

  return (await $v1.post('/flows', { flows })).data
}

export const set_tg_token = async (token: { [name: string]: string }) => {
  try {
    await $v1.post('/flows/tg_token', token)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_tg_tokens = async (): Promise<string[]> => {
  try {
    const { data } = await $v1.get('/flows/get_tg_tokens')
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}
