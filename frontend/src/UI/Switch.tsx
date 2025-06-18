import { Switch as SwitchRoot, SwitchThumb } from '@radix-ui/react-switch'
import classNames from 'classnames'
import cn from 'classnames'
import { ElementType, ReactNode } from 'react'

interface IProps {
  checked: boolean
  onChange: (checked: boolean) => void
  startContent?: ReactNode
  endContent?: ReactNode
  className?: string
  thumbClassNames?: string
}

const Switch = ({
  checked,
  onChange,
  startContent,
  endContent,
  className,
  thumbClassNames,
}: IProps) => {
  return (
    <SwitchRoot
      onCheckedChange={onChange}
      checked={checked}
      className={cn(
        'group relative flex h-6 w-11 items-center rounded-2xl p-[2px] data-[state=checked]:bg-text-secondary data-[state=unchecked]:bg-input-border',
        className,
      )}
    >
      {checked ? (
        <div className='absolute ml-0.5'>{startContent}</div>
      ) : (
        <div className='absolute ml-6'>{endContent}</div>
      )}

      <SwitchThumb
        className={cn(
          'block h-5 w-5 rounded-full bg-background transition-all duration-150 group-active:w-6 data-[state=checked]:ml-5 data-[state=checked]:group-active:ml-4',
          thumbClassNames,
        )}
      />
    </SwitchRoot>
  )
}

export default Switch
