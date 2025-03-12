import { get_tg_tokens, set_tg_token } from '@/api/flows'
import { buildContext } from '@/contexts/buildContext'
import { runContext } from '@/contexts/runContext'
import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { Eye, EyeOff } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import FormControl from '../../UI/FormControl'

interface IFormData {
  name: string
  buildId: string | null
  preset: string
  tokenName: string
  tokenValue: string
}

interface ITokenState {
  isTokensAdding: boolean
  isTelegram: boolean
  tokens: string[]
}

const inputClassNames = {
  inputWrapper: ['border-none', 'data-[focus=true]:after:h-0', 'shadow-none'],
  input: ['w-full', 'truncate', 'placeholder:text-input-border'],
}

const StartRunForm = () => {
  const { builds } = useContext(buildContext)
  const { runs, runStart, startingRunId } = useContext(runContext)

  const successBuilds = builds.filter((b) => b.status === 'completed')
  const buildNames = successBuilds.map((b) => ({
    name: b.preset.name,
    id: b.id.toString(),
  }))
  const usedTelegramTokens = runs
    .filter((r) => r.messenger === 'telegram' && r.status === 'alive')
    .map((r) => r.preset.tg_bot_token)

  const initialFormData: IFormData = {
    name: `Run ${runs.length}`,
    buildId: null,
    preset: 'None',
    tokenName: '',
    tokenValue: '',
  }
  const initialTokenState: ITokenState = {
    isTokensAdding: false,
    isTelegram: false,
    tokens: [],
  }

  const [formData, setFormData] = useState<IFormData>(initialFormData)
  const [tokenState, setTokenState] = useState<ITokenState>(initialTokenState)
  const [hidePassword, setHidePassword] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<{
    build?: string
    tokenName?: string
    tokenValue?: string
  }>({})

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleBuildChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBuild = successBuilds.find(
      (b) => String(b.id) === e.target.value,
    )
    const isTelegram = selectedBuild?.preset.messenger === 'telegram'
    if (isTelegram) {
      // fetch tokens
      try {
        const tokens = tokenState.tokens.length
          ? tokenState.tokens
          : await (await get_tg_tokens()).reverse()
        setTokenState((state) => ({ ...state, tokens }))
      } catch (error) {
        console.log(error)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setFieldErrors(({ tokenName, tokenValue, ...errors }) => errors)
    }

    setFormData((prev) => ({
      ...prev,
      buildId: e.target.value,
    }))
    setTokenState((state) => ({
      ...state,
      isTelegram,
      isTokensAdding: isTelegram ? state.isTokensAdding : false,
    }))

    const aliveWebRunBuildIds = runs
      .filter((r) => r.status === 'alive' && r.messenger === 'web')
      .map((r) => r.build_id)
    const buildError = !e.target.value.length
      ? 'Please select a build'
      : aliveWebRunBuildIds.includes(Number(e.target.value))
        ? 'This build is already in use'
        : undefined
    setFieldErrors((errors) => ({
      ...errors,
      build: buildError,
    }))
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, preset: e.target.value || 'None' }))
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isTokensAdding = e.target.value === 'New token'
    setTokenState((state) => ({
      ...state,
      isTokensAdding,
    }))
    setFormData((prev) => ({
      ...prev,
      tokenName: isTokensAdding ? '' : e.target.value,
      tokenValue: '',
    }))

    const error = !e.target.value.length
      ? 'Please select Telegram token'
      : usedTelegramTokens.includes(e.target.value)
        ? 'This token is already in use'
        : undefined
    setFieldErrors((errors) => ({
      ...errors,
      tokenValue: undefined,
      tokenName: error,
    }))
  }

  const handleTokenNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({
      ...data,
      tokenName: e.target.value.replaceAll(' ', '_').toUpperCase(),
    }))
    setFieldErrors((errors) => {
      const error = e.target.value.length
        ? undefined
        : 'Please enter Telegram token name'
      return { ...errors, tokenName: error }
    })
  }
  const handleTokenValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({ ...data, tokenValue: e.target.value }))
    setFieldErrors((errors) => {
      const error = e.target.value.length
        ? undefined
        : 'Please enter Telegram token to access the HTTP API'
      return { ...errors, tokenValue: error }
    })
  }

  const validateFields = () => {
    let tokenNameError: string | undefined

    if (tokenState.isTelegram) {
      if (!formData.tokenName) {
        tokenNameError = tokenState.isTokensAdding
          ? 'Please enter Telegram token name'
          : 'Please select Telegram token'
      } else if (
        tokenState.tokens.includes(formData.tokenName) &&
        tokenState.isTokensAdding
      ) {
        tokenNameError = 'The token with this name already exists'
      } else if (
        usedTelegramTokens.includes(formData.tokenName) &&
        !tokenState.isTokensAdding
      ) {
        tokenNameError = 'This token is already in use'
      }
    }

    const tokenValueError =
      tokenState.isTokensAdding && !formData.tokenValue
        ? 'Please enter Telegram token to access the HTTP API'
        : undefined

    const aliveWebRunBuildIds = runs
      .filter((r) => r.status === 'alive' && r.messenger === 'web')
      .map((r) => r.build_id)
    const buildError = !formData.buildId
      ? 'Please select a build'
      : aliveWebRunBuildIds.includes(Number(formData.buildId))
        ? 'This build is already in use'
        : undefined
    setFieldErrors({
      tokenName: tokenNameError,
      tokenValue: tokenValueError,
      build: buildError,
    })

    return !tokenNameError && !tokenValueError && !buildError
  }

  const handleStartRun = async () => {
    if (!validateFields()) return
    if (!formData.buildId) return

    if (tokenState.isTelegram) {
      if (tokenState.isTokensAdding) {
        await set_tg_token({ [formData.tokenName]: formData.tokenValue })
        const tokens = await get_tg_tokens()
        setTokenState((state) => ({ ...state, tokens }))
      }
      await runStart(formData.buildId, {
        end_status: 'success',
        preset: formData.preset,
        name: formData.name || `Run ${runs.length}`,
        build_name: buildNames.find((b) => b.id === formData.buildId)
          ?.name as string,
        tg_bot_token: formData.tokenName,
      })
    } else {
      await runStart(formData.buildId, {
        end_status: 'success',
        preset: formData.preset,
        name: formData.name || `Run ${runs.length}`,
        build_name: buildNames.find((b) => b.id === formData.buildId)
          ?.name as string,
      })
    }
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Run ${runs.length}` }))
  }, [runs])

  return (
    <div className='flex h-full w-full flex-col gap-3'>
      <div className='flex flex-grow flex-col'>
        {/* NAME FIELD */}
        <FormControl
          label='Name'
          input={
            <Input
              placeholder={`Run ${runs.length}`}
              value={formData.name}
              onChange={handleNameChange}
              disableAnimation
              size='sm'
              variant='underlined'
              classNames={inputClassNames}
            />
          }
        />

        {/* BUILD FIELD */}
        <FormControl
          label='Build'
          isError={!!fieldErrors.build}
          errorMessage={fieldErrors.build}
          input={
            <Select
              aria-label='Build'
              labelPlacement='outside'
              placeholder='Select build'
              onChange={handleBuildChange}
              radius='sm'
              size='sm'
            >
              {buildNames.map((item) => (
                <SelectItem key={item.id} textValue={item.name}>
                  {item.name}
                </SelectItem>
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
              labelPlacement='outside'
              defaultSelectedKeys={['None']}
              placeholder='No preset'
              onChange={handlePresetChange}
              radius='sm'
              size='sm'
            >
              {[{ key: 'None', label: 'No preset' }].map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          }
        />

        {tokenState.isTelegram && (
          <>
            {/* TOKEN FIELD */}
            <FormControl
              label='Token'
              isError={!tokenState.isTokensAdding && !!fieldErrors.tokenName}
              errorMessage={fieldErrors.tokenName}
              input={
                <Select
                  aria-label='Token'
                  labelPlacement='outside'
                  placeholder='Select token'
                  onChange={handleTokenChange}
                  radius='sm'
                  size='sm'
                >
                  {['New token', ...tokenState.tokens].map((item) => (
                    <SelectItem key={item}>{item}</SelectItem>
                  ))}
                </Select>
              }
            />

            {tokenState.isTokensAdding && (
              <>
                {/* TOKEN_NAME FIELD */}
                <FormControl
                  label='Token name'
                  isError={!!fieldErrors.tokenName}
                  errorMessage={fieldErrors.tokenName}
                  input={
                    <Input
                      placeholder='Enter Telegram token name'
                      value={formData.tokenName}
                      onChange={handleTokenNameChange}
                      disableAnimation
                      size='sm'
                      variant='underlined'
                      classNames={inputClassNames}
                    />
                  }
                />

                {/* TOKEN_VALUE FIELD */}
                <FormControl
                  label='Token value'
                  isError={!!fieldErrors.tokenValue}
                  errorMessage={fieldErrors.tokenValue}
                  input={
                    <>
                      <Input
                        type={hidePassword ? 'password' : 'text'}
                        placeholder='Enter Telegram token value'
                        value={formData.tokenValue}
                        onChange={handleTokenValueChange}
                        disableAnimation
                        size='sm'
                        variant='underlined'
                        classNames={inputClassNames}
                      />
                      <button
                        className='h-6 w-6 hover:scale-105 active:scale-95'
                        onClick={() => setHidePassword((prev) => !prev)}
                      >
                        {hidePassword ? (
                          <Eye
                            className='stroke-input-border text-base'
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className='stroke-input-border text-base'
                            size={20}
                          />
                        )}
                      </button>
                    </>
                  }
                />
              </>
            )}
          </>
        )}
      </div>
      <div>
        <Button
          onClick={handleStartRun}
          isDisabled={
            startingRunId !== null ||
            !!fieldErrors.build ||
            !!fieldErrors.tokenName ||
            !!fieldErrors.tokenValue
          }
          className='w-full rounded-lg bg-foreground font-semibold text-background'
        >
          Run
        </Button>
      </div>
    </div>
  )
}

export default StartRunForm
