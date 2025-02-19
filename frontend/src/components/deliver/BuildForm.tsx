import { messengerType } from "@/api/bot"
import { buildContext } from "@/contexts/buildContext"
import { Button, Input, Select, SelectItem } from "@nextui-org/react"
import { QuestionMarkIcon } from "@radix-ui/react-icons"
import { useContext, useEffect, useState } from "react"
import FormControl from "../../UI/FormControl"

interface IFormData {
  name: string
  messenger: messengerType
  preset: string
}

const messengers = [
  { label: "Telegram", key: "telegram" },
  { label: "Web", key: "web" },
]

const BuildForm = () => {
  const { buildStart, buildPending, builds } = useContext(buildContext)

  const initialData: IFormData = {
    name: `Build ${builds.length}`,
    messenger: "web",
    preset: "None",
  }
  const [formData, setFormData] = useState<IFormData>(initialData)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }))
  }

  const handleMessengerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(
      (prev) =>
        ({
          ...prev,
          messenger: e.target.value || "web",
        } as IFormData)
    )
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, preset: e.target.value || "None" }))
  }

  const handleBuild = async () => {
    await buildStart({
      end_status: "success",
      ...formData,
      name: formData.name || `Build ${builds.length}`,
    })
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Build ${builds.length}` }))
  }, [builds])

  return (
    <div className='h-full w-full flex flex-col gap-3'>
      <div className='flex-grow flex flex-col'>
        {/* NAME FIELD */}
        <FormControl
          label='Name'
          input={
            <Input
              placeholder={`Build ${builds.length}`}
              value={formData.name}
              onChange={handleNameChange}
              disableAnimation
              size='sm'
              variant='underlined'
              classNames={{
                inputWrapper: ["border-none", "data-[focus=true]:after:h-0", "shadow-none"],
                input: ["w-full", "truncate", "placeholder:text-input-border"],
              }}
            />
          }
        />

        {/* MESSENGER FIELD */}
        <FormControl
          label='Messenger'
          input={
            <Select
              aria-label='Messenger'
              labelPlacement='outside'
              placeholder='Web'
              defaultSelectedKeys={["web"]}
              value={formData.messenger}
              onChange={handleMessengerChange}
              radius='sm'
              size='sm'
            >
              {messengers.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          }
        />

        {/* PRESET FIELD */}
        <FormControl
          label='Preset'
          input={
            <Select
              aria-label='Preset'
              placeholder='No preset'
              labelPlacement='outside'
              defaultSelectedKeys={["None"]}
              value={formData.preset}
              onChange={handlePresetChange}
              radius='sm'
              size='sm'
            >
              {[{ key: "None", label: "No preset" }].map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          }
        />
      </div>

      <div className='flex gap-3'>
        <Button isIconOnly className='rounded-full'>
          <QuestionMarkIcon className='w-5 h-5' />
        </Button>
        <Button
          onClick={handleBuild}
          isDisabled={buildPending}
          className='font-semibold bg-foreground text-background rounded-lg w-full'
        >
          Build
        </Button>
      </div>
    </div>
  )
}

export default BuildForm
