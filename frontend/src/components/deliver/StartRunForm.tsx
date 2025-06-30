import { buildContext } from '@/contexts/buildContext'
import { runContext } from '@/contexts/runContext'
import { workspaceContext } from '@/contexts/workspaceContext'
import { Button } from '@/UI/button'
import { Input } from '@/UI/Input'
import { Select } from '@/UI/Select'
import { useContext, useEffect, useState } from 'react'
import FormControl from '../../UI/FormControl'

export interface IFormData {
  name: string
  buildId?: string
}

interface IFieldErrors {
  build?: string
  tokenName?: string
  tokenValue?: string
}

export interface IFormState {
  formData: IFormData
  fieldErrors: IFieldErrors
}

const StartRunForm = () => {
  const { builds } = useContext(buildContext)
  const { runs, runStart, runStarting } = useContext(runContext)
  const { startRunFormState: formState, setStartRunFormState } =
    useContext(workspaceContext)
  const successBuilds = builds.filter((b) => b.status === 'completed')
  const buildNames = successBuilds.map((b) => ({
    value: b.preset.name,
    key: b.id.toString(),
  }))

  const initialFormData: IFormData = {
    name: `Запуск ${runs.length}`,
    buildId: undefined,
  }

  const [formData, setFormData] = useState<IFormData>(
    formState?.formData || initialFormData,
  )
  const [fieldErrors, setFieldErrors] = useState<IFieldErrors>(
    formState?.fieldErrors || {},
  )

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }))
  }

  const handleBuildChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      buildId: value,
    }))

    const aliveWebRunBuildIds = runs
      .filter(
        (r) =>
          r.messenger === 'web' &&
          (r.status === 'alive' || r.status === 'running'),
      )
      .map((r) => r.build_id)
    const buildError = !value.length
      ? 'Please select a build'
      : aliveWebRunBuildIds.includes(Number(value))
        ? 'This build is already in use'
        : undefined
    setFieldErrors((errors) => ({
      ...errors,
      build: buildError,
    }))
  }

  const validateFields = () => {
    const aliveWebRunBuildIds = runs
      .filter(
        (r) =>
          r.messenger === 'web' &&
          (r.status === 'alive' || r.status === 'running'),
      )
      .map((r) => r.build_id)
    const buildError = !formData.buildId
      ? 'Please select a build'
      : aliveWebRunBuildIds.includes(Number(formData.buildId))
        ? 'This build is already in use'
        : undefined
    setFieldErrors({
      build: buildError,
    })

    return !buildError
  }

  const handleStartRun = async () => {
    if (!validateFields()) return
    if (!formData.buildId) return

    await runStart(formData.buildId, {
      end_status: 'success',
      // preset: formData.preset,
      name: formData.name || `Запуск ${runs.length}`,
      build_name: buildNames.find((b) => b.key === formData.buildId)
        ?.value as string,
    })
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Запуск ${runs.length}` }))
  }, [runs])

  useEffect(() => {
    return () => {
      setStartRunFormState({
        formData,
        fieldErrors,
      })
    }
  }, [formData, fieldErrors, setStartRunFormState])

  useEffect(() => {
    if (formState) {
      setFormData(formState?.formData)
      setFieldErrors(formState?.fieldErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex h-full w-full flex-col gap-3'>
      <div className='flex flex-grow flex-col'>
        {/* NAME FIELD */}
        <FormControl
          label='Имя запуска'
          input={
            <Input
              placeholder={`Запуск ${runs.length}`}
              value={formData.name}
              onChange={handleNameChange}
              borderless
            />
          }
        />

        {/* BUILD FIELD */}
        <FormControl
          label='Сборка'
          isError={!!fieldErrors.build}
          errorMessage={fieldErrors.build}
          input={
            <Select
              aria-label='Build'
              placeholder='Выберите сборку'
              onValueChange={handleBuildChange}
              items={buildNames}
              defaultValue={formData.buildId}
              // selectedKeys={formData.buildId ? [formData.buildId] : []}
            />
          }
        />
      </div>
      <div>
        <Button
          onClick={handleStartRun}
          isDisabled={
            runStarting ||
            !!fieldErrors.build ||
            !!fieldErrors.tokenName ||
            !!fieldErrors.tokenValue
          }
          className='w-full rounded-lg bg-foreground font-semibold text-background'
        >
          Запустить
        </Button>
      </div>
    </div>
  )
}

export default StartRunForm
