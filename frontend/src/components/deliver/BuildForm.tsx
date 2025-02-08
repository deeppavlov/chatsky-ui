import { messengerType } from "@/api/bot"
import { buildContext } from "@/contexts/buildContext"
import { Button, Divider, Input, Select, SelectItem } from "@nextui-org/react"
import { QuestionMarkIcon } from "@radix-ui/react-icons"
import { useContext, useEffect, useState } from "react"

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

  const buildHandler = async () => {
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
        <div className='flex relative'>
          <div className='flex flex-col min-w-[100px]'>
            <div className='h-12 flex items-center mr-4'>
              <span className='text-sm font-semibold text-neutral-500'>Name</span>
            </div>
          </div>
          <div className='flex flex-col basis-full w-0'>
            <div className='h-12 flex items-center justify-end'>
              <Input
                placeholder={`Build ${builds.length}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }}
                disableAnimation
                size='sm'
                variant='underlined'
                classNames={{
                  inputWrapper: ["border-none", "data-[focus=true]:after:h-0", "shadow-none"],
                  input: ["w-full", "truncate", "placeholder:text-input-border"],
                }}
              />
            </div>
          </div>
          <Divider className='absolute bottom-0' />
        </div>

        {/* MESSENGER FIELD */}
        <div className='flex relative'>
          <div className='flex flex-col min-w-[100px]'>
            <div className='h-12 flex items-center mr-4'>
              <span className='text-sm font-semibold text-neutral-500'>Messenger</span>
            </div>
          </div>
          <div className='flex flex-col basis-full w-0'>
            <div className='h-12 flex items-center justify-end'>
              <Select
                aria-label='Messenger'
                labelPlacement='outside'
                placeholder='Web'
                defaultSelectedKeys={["web"]}
                value={formData.messenger}
                onChange={(e) => {
                  setFormData(
                    (prev) =>
                      ({
                        ...prev,
                        messenger: e.target.value || "web",
                      } as IFormData)
                  )
                }}
                radius='sm'
                size='sm'
              >
                {messengers.map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <Divider className='absolute bottom-0' />
        </div>

        {/* PRESET FIELD */}
        <div className='flex relative'>
          <div className='flex flex-col min-w-[100px]'>
            <div className='h-12 flex items-center mr-4'>
              <span className='text-sm font-semibold text-neutral-500'>Preset</span>
            </div>
          </div>
          <div className='flex flex-col basis-full w-0'>
            <div className='h-12 flex items-center justify-end'>
              <Select
                aria-label='Preset'
                placeholder='No preset'
                labelPlacement='outside'
                defaultSelectedKeys={["None"]}
                value={formData.preset}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, preset: e.target.value || "None" }))
                }}
                radius='sm'
                size='sm'
              >
                {[{ key: "None", label: "No preset" }].map((item) => (
                  <SelectItem key={item.key}>{item.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <Divider className='absolute bottom-0' />
        </div>
      </div>

      <div className='flex gap-3'>
        <Button isIconOnly className='rounded-full'>
          <QuestionMarkIcon className='w-5 h-5' />
        </Button>
        <Button
          onClick={buildHandler}
          disabled={buildPending}
          className='font-semibold bg-foreground text-background rounded-lg w-full'
        >
          Build
        </Button>
      </div>
    </div>
  )
}

export default BuildForm
