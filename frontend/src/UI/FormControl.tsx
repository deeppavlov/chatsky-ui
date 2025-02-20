import { Divider } from "@nextui-org/react"
import cn from "classnames"

interface IProps {
  label: string
  input: React.ReactNode
  isError?: boolean
  errorMessage?: string
}

const FormString: React.FC<IProps> = ({ label, input, isError, errorMessage }) => {
  return (
    <div className='flex flex-col'>
      <div className='flex'>
        <div className='flex flex-col min-w-[100px]'>
          <div className='h-12 flex items-center mr-4'>
            <span
              className={cn(
                "text-sm font-semibold whitespace-nowrap",
                isError ? "text-danger" : "text-base"
              )}
            >
              {label}
            </span>
          </div>
        </div>
        <div className='flex flex-col basis-full w-0'>
          <div className='h-12 flex items-center justify-end'>{input}</div>
        </div>
      </div>
      <Divider className={cn(isError && "bg-danger")} />
      {isError && <div className='text-danger text-xs mt-1'>{errorMessage}</div>}
    </div>
  )
}

export default FormString
