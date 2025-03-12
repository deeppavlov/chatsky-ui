import { Divider } from '@nextui-org/react'
import cn from 'classnames'

interface IProps {
  label: string
  input: React.ReactNode
  isError?: boolean
  errorMessage?: string
}

const FormString: React.FC<IProps> = ({
  label,
  input,
  isError,
  errorMessage,
}) => {
  return (
    <div className='flex flex-col'>
      <div className='flex'>
        <div className='flex min-w-[100px] flex-col'>
          <div className='mr-4 flex h-12 items-center'>
            <span
              className={cn(
                'whitespace-nowrap text-sm font-semibold',
                isError ? 'text-danger' : 'text-base',
              )}
            >
              {label}
            </span>
          </div>
        </div>
        <div className='flex w-0 basis-full flex-col'>
          <div className='flex h-12 items-center justify-end'>{input}</div>
        </div>
      </div>
      <Divider className={cn(isError && 'bg-danger')} />
      {isError && (
        <div className='mt-1 text-xs text-danger'>{errorMessage}</div>
      )}
    </div>
  )
}

export default FormString
