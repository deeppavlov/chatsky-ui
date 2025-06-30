import { checkBuildIsChanged } from '@/api/bot'
import { buildContext } from '@/contexts/buildContext'
import { PopUpContext } from '@/contexts/popUpContext'
import { workspaceContext } from '@/contexts/workspaceContext'
import RebuildModal from '@/modals/RebuildModal/RebuildModal'
import { Button } from '@/UI/button'
import { Input } from '@/UI/Input'
import { QuestionMarkIcon } from '@radix-ui/react-icons'
import { useContext, useEffect, useState } from 'react'
import FormControl from '../../UI/FormControl'

export interface IFormData {
  name: string
}

const BuildForm = () => {
  const { buildFormData, setBuildFormData } = useContext(workspaceContext)
  const { buildStart, buildPending, builds } = useContext(buildContext)
  const { openPopUp } = useContext(PopUpContext)

  const initialData: IFormData = {
    name: `Сборка ${builds.length}`,
    // тут могут быть дополнительные поля, такие как messenger, preset, etc
  }
  const [formData, setFormData] = useState<IFormData>(
    buildFormData ?? initialData,
  )

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }))
  }

  const handleConfirmRebuild = () => {
    openPopUp(
      <RebuildModal
        id='rebuild'
        onRebuild={async () => {
          await buildStart({
            end_status: 'success',
            // ...formData,
            name: formData.name || `Сборка ${builds.length}`,
          })
        }}
      />,
      'rebuild',
    )
  }

  const handleBuild = async () => {
    const flowUpdated = await checkBuildIsChanged()

    if (!flowUpdated) {
      handleConfirmRebuild()
      return
    }

    await buildStart({
      end_status: 'success',
      ...formData,
      name: formData.name || `Сборка ${builds.length}`,
    })
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Сборка ${builds.length}` }))
  }, [builds])

  useEffect(() => {
    return () => {
      setBuildFormData(formData)
    }
  }, [formData, setBuildFormData])

  useEffect(() => {
    if (buildFormData) {
      setFormData(buildFormData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex h-full w-full flex-col gap-3'>
      <div className='flex flex-grow flex-col'>
        {/* NAME FIELD */}
        <FormControl
          label='Имя сборки'
          input={
            <Input
              placeholder={`Сборка ${builds.length}`}
              value={formData.name}
              onChange={handleNameChange}
              borderless
            />
          }
        />
      </div>

      <div className='flex gap-3'>
        <Button
          variant='primary'
          isIconOnly
          className='flex-shrink-0 rounded-full bg-btn-accent'
        >
          <QuestionMarkIcon className='h-5 w-5' />
        </Button>
        <Button
          variant='primary'
          onClick={handleBuild}
          isDisabled={buildPending}
          className='w-full rounded-lg bg-btn-accent font-semibold text-background'
        >
          Начать
        </Button>
      </div>
    </div>
  )
}

export default BuildForm
