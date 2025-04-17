import { Radio, RadioGroup } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import AttentionIcon from '../../../icons/AttentionIcon'
import { conditionType } from '../../../types/ConditionTypes'
import InputText from '../../../UI/Input/DefInput'
import DefSelect from '../../../UI/Input/DefSelect'

interface ButtonState {
  text: string
  callback?: string
  type: string
  id: string
}

interface IMapping {
  [key: string]: (
    state: ButtonState,
    setState: (state: ButtonState) => void,
  ) => JSX.Element
}

const mapping: IMapping = {
  exactMatch: (state, setState) => {
    return (
      <>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <p className=''>Structure</p>
          </div>

          <DefSelect
            mini
            className='w-full'
            defaultValue={'Exact match'}
            items={[{ value: 'Exact match', key: 'exactMatch' }]}
            placeholder='Choose group'
            disabled={true}
          />
        </div>
        <div className={`flex flex-col gap-[12px]`}>
          <div className=''>
            <p>Text</p>
            <div className='flex items-center gap-2'>
              <AttentionIcon stroke='#3300FF' />
              <p className='text-[12px]'>
                When a button is pressed, the text below will be sent to the bot
                and processed as exact match.
              </p>
            </div>
          </div>
          <InputText
            value={state.text}
            onChange={(e) => setState({ ...state, text: e.target.value })}
          />
        </div>
      </>
    )
  },
  hasCallback: (state, setState) => {
    return (
      <>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <p className=''>Structure</p>
          </div>

          <DefSelect
            mini
            className='w-full'
            defaultValue={'Has callback query'}
            items={[{ value: 'Has callback query', key: 'hasCallbackQuery' }]}
            placeholder='Choose group'
            disabled={true}
          />
        </div>
        <div className={`flex flex-col gap-[12px]`}>
          <div className=''>
            <p>Callback data</p>
            <div className='flex items-center gap-2'>
              <AttentionIcon stroke='#3300FF' />
              <p className='text-[12px]'>
                Callback data is a string of text that will indicate that a
                specific button was pressed. Do not use the same text twice.
              </p>
            </div>
          </div>
          <InputText
            value={state.callback}
            onChange={(e) => setState({ ...state, callback: e.target.value })}
          />
        </div>
      </>
    )
  },
}

const ButtonCondition = ({
  condition,
  setData,
}: {
  condition: conditionType
  setData: (state: conditionType) => void
}) => {
  const initialState =
    condition.data.button?.type === 'exactMatch'
      ? {
          text: '',
          type: 'exactMatch',
          id: '0',
        }
      : {
          text: '',
          colback: '',
          type: 'hasCallback',
          id: '0',
        }

  console.log(condition)

  const [state, setState] = useState<ButtonState>(
    condition.data.button ?? initialState,
  )

  useEffect(() => {
    const newCondition = {
      ...condition,
      data: {
        button: state,
        priority: condition.data.priority,
        transition_type: condition.data.transition_type,
      },
    }

    setData(newCondition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className='flex flex-col gap-[24px]'>
      <div className='flex flex-1 flex-col gap-[24px] py-2'>
        <div className='flex items-center gap-2'>
          <AttentionIcon width={34} height={34} stroke='#3300FF' />
          <div className='text-[12px] text-sm font-medium'>
            Buttons are only available for Telegram interface. If you are
            planning to launch your bot on different platforms, please select
            another condition type.
          </div>
        </div>

        <div>
          <h3 className='mb-4 font-medium'>Button type</h3>
          <RadioGroup
            value={'type' in state ? state.type : 'reply'}
            onValueChange={(value) =>
              setState({ ...state, type: value, text: '', callback: '' })
            }
          >
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-4'>
                <Radio value='exactMatch'>Reply keyboard</Radio>
              </div>
              <div className='flex flex-col gap-4'>
                <Radio value='hasCallback'>Inline keyboard</Radio>
              </div>
            </div>
          </RadioGroup>
        </div>
        {state.type && mapping[state.type](state, setState)}
      </div>
    </div>
  )
}

export default ButtonCondition
