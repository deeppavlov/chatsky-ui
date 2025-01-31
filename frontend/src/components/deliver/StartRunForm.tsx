import { buildContext } from "@/contexts/buildContext"
import { runContext } from "@/contexts/runContext"
import { Button, Divider, Input, Select, SelectItem } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"

interface IFormData {
  name: string
  buildId: string | null
  preset: string
}

const StartRunForm = () => {
  const { builds } = useContext(buildContext)
  const { runs, runStart, runPending } = useContext(runContext)

  const successBuilds = builds.filter((b) => b.status === "completed")
  const buildNames = successBuilds.map((b) => ({ name: b.preset.name, id: b.id.toString() }))

  const initialData: IFormData = {
    name: `Run ${runs.length}`,
    buildId: null,
    preset: "None",
  }

  const [formData, setFormData] = useState<IFormData>(initialData)

  const runHandler = async () => {
    if (!formData.buildId) return

    await runStart(formData.buildId, {
      end_status: "success",
      preset: formData.preset,
      name: formData.name,
      build_name: buildNames.find((b) => b.id === formData.buildId)?.name as string,
    })
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Run ${runs.length + 1}` }))
  }, [runs.length])

  return (
    <div className='h-full w-full flex flex-col gap-3'>
      <div className='flex-grow flex'>
        <div className='flex flex-col min-w-[100px]'>
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Name</span>
          </div>
          <Divider />
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Build</span>
          </div>
          <Divider />
          <div className='h-12 flex items-center mr-4'>
            <span className='text-sm font-semibold text-neutral-500'>Preset</span>
          </div>
        </div>

        <div className='flex flex-col basis-full w-0'>
          <div className='h-12 flex items-center justify-end'>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }}
              disableAnimation
              size='sm'
              variant='underlined'
            />
          </div>
          <Divider />
          <div className='h-12 flex items-center justify-end'>
            <Select
              aria-label='Build'
              labelPlacement='outside'
              placeholder='Select build'
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  buildId: e.target.value,
                }))
              }}
              radius='sm'
              size='sm'
            >
              {buildNames.map((item) => (
                <SelectItem key={item.id} textValue={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Divider />
          <div className='h-12 flex items-center justify-end'>
            <Select
              aria-label='Preset'
              labelPlacement='outside'
              defaultSelectedKeys={["None"]}
              placeholder='No preset'
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
          onClick={runHandler}
          isDisabled={runPending || !formData.buildId}
          className='font-semibold bg-foreground text-background rounded-lg w-full'
        >
          Run
        </Button>
      </div>
    </div>
  )
}

export default StartRunForm
