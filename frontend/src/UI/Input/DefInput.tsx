import { Input, InputProps, InputSlots, SlotsToClasses } from "@nextui-org/react"
import classNames from "classnames"


// const DefInput = ({ className, label, labelClassName, wrapperClassName, ...props }: DefInputType) => {
//   return (
//     <div className={classNames("flex flex-col w-full", wrapperClassName)}>
//       <label className={classNames("text-sm text-input-border-focus font-medium", labelClassName)}>{label}</label>
//       <input
//         className={classNames(
//           "min-h-10 h-10 bg-input-background text-input-foreground border border-input-border focus:border-input-border-focus focus:outline-input-border-focus placeholder:text-input-border-focus rounded-[8px] px-3.5",
//           className
//         )}
//         {...props}
//       />
//     </div>
//   )
// }

const defInputStyles: SlotsToClasses<InputSlots> = {
  label: "text-black/50 dark:text-white/90",
  input: [
    "bg-transparent",
    "placeholder:text-input-border-focus",
  ],
  innerWrapper: "bg-transparent",
  inputWrapper: [
    "min-h-10 h-10",
    "px-3.5",
    "rounded-[8px]",
    "shadow-none",
    "bg-input-background",
    "border border-input-border",
    "hover:bg-transparent",
    "group-data-[focus=true]:bg-input-background",
    "group-data-[hover=true]:bg-input-background-disabled",
    "!cursor-text",
  ],
}

const DefInput = ({ className, ...props }: InputProps) => {
  return (
    <Input
      labelPlacement="outside"
      classNames={defInputStyles}
      className={classNames("w-full", className)}
      {...props}
    />
  )
}

export default DefInput
