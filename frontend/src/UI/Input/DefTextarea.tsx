import { InputSlots, SlotsToClasses, Textarea, TextAreaProps } from "@nextui-org/react"
import classNames from "classnames"

const defInputStyles: SlotsToClasses<InputSlots> = {
  label: "text-black/50 dark:text-white/90",
  input: ["bg-transparent", "placeholder:text-input-border-focus"],
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

const DefTextarea = ({ className, ...props }: TextAreaProps) => {
  return (
    <Textarea
      classNames={defInputStyles}
      className={classNames("w-full", className)}
      {...props}
    />
  )
}

export default DefTextarea
