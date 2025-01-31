import { messengerType } from "@/api/bot"
import { buildContext } from "@/contexts/buildContext"
import { Button, Divider, Input, Select, SelectItem } from "@nextui-org/react"
import { useContext, useState } from "react"

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
    setFormData({
      ...initialData,
      name: `Build ${builds.length + 1}`,
    })
  }

  return (
    <div className='h-full w-full flex flex-col gap-3'>
      <div className='flex-grow flex'>
        <div className='flex flex-col min-w-[100px]'>
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Name</span>
          </div>
          <Divider />
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Messenger</span>
          </div>
          <Divider />
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Preset</span>
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
            />
          </div>
          <Divider />
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
          <Divider />
          <div className='h-12 flex items-center justify-end'>
            <Select
              aria-label='Messenger'
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
      </div>
      <div>
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
