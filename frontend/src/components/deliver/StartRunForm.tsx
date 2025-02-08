import { get_tg_tokens, set_tg_token } from "@/api/flows"
import { buildContext } from "@/contexts/buildContext"
import { runContext } from "@/contexts/runContext"
import { Button, Divider, Input, Select, SelectItem } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"
import cn from "classnames"

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
  inputWrapper: ["border-none", "data-[focus=true]:after:h-0", "shadow-none"],
  input: ["w-full", "truncate", "placeholder:text-input-border"],
}

const StartRunForm = () => {
  const { builds } = useContext(buildContext)
  const { runs, runStart, startingRunId } = useContext(runContext)

  const successBuilds = builds.filter((b) => b.status === "completed")

  const buildNames = successBuilds.map((b) => ({ name: b.preset.name, id: b.id.toString() }))

  const initialFormData: IFormData = {
    name: `Run ${runs.length}`,
    buildId: null,
    preset: "None",
    tokenName: "",
    tokenValue: "",
  }
  const initialTokenState: ITokenState = {
    isTokensAdding: false,
    isTelegram: false,
    tokens: [],
  }

  const [formData, setFormData] = useState<IFormData>(initialFormData)
  const [tokenState, setTokenState] = useState<ITokenState>(initialTokenState)
  const [fieldErrors, setFieldErrors] = useState<{
    build: string | null
    tokenName: string | null
    tokenValue: string | null
  }>({
    build: null,
    tokenName: null,
    tokenValue: null,
  })

  const handleBuildChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBuild = successBuilds.find((b) => String(b.id) === e.target.value)
    const isTelegram = selectedBuild?.preset.messenger === "telegram"
    if (isTelegram) {
      // fetch tokens
      try {
        const tokens = tokenState.tokens.length ? tokenState.tokens : await get_tg_tokens()
        setTokenState((state) => ({ ...state, tokens }))
      } catch (error) {
        console.log(error)
      }
    }

    setFormData((prev) => ({
      ...prev,
      buildId: e.target.value,
    }))
    setTokenState((state) => ({
      ...state,
      isTelegram,
    }))
    setFieldErrors((errors) => ({
      ...errors,
      build: e.target.value.length ? null : "Please select a build",
    }))
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, preset: e.target.value || "None" }))
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isTokensAdding = e.target.value === "New token"
    setTokenState((state) => ({
      ...state,
      isTokensAdding,
    }))
    setFormData((prev) => ({
      ...prev,
      tokenName: isTokensAdding ? "" : e.target.value,
      tokenValue: "",
    }))

    const error = e.target.value.length ? null : "Please select Telegram token"
    setFieldErrors((errors) => ({ ...errors, tokenValue: null, tokenName: error }))
  }

  const handleTokenNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({ ...data, tokenName: e.target.value }))
    setFieldErrors((errors) => {
      const error = e.target.value.length ? null : "Please enter Telegram token name"
      return { ...errors, tokenName: error }
    })
  }
  const handleTokenValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({ ...data, tokenValue: e.target.value }))
    setFieldErrors((errors) => {
      const error = e.target.value.length
        ? null
        : "Please enter Telegram token to access the HTTP API"
      return { ...errors, tokenValue: error }
    })
  }

  const validateFields = () => {
    const nameError = !formData.tokenName
      ? "Please enter Telegram token name"
      : tokenState.isTokensAdding && tokenState.tokens.includes(formData.tokenName)
      ? "The token with this name already exists"
      : null
    const valueError =
      tokenState.isTokensAdding && !formData.tokenValue
        ? "Please enter Telegram token to access the HTTP API"
        : null
    const buildError = !formData.buildId ? "Please select a build" : null
    setFieldErrors({
      tokenName: nameError,
      tokenValue: valueError,
      build: buildError,
    })

    return !nameError && !valueError && !buildError
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
        end_status: "success",
        preset: formData.preset,
        name: formData.name || `Run ${runs.length}`,
        build_name: buildNames.find((b) => b.id === formData.buildId)?.name as string,
        tg_bot_token: formData.tokenName,
      })
    } else {
      await runStart(formData.buildId, {
        end_status: "success",
        preset: formData.preset,
        name: formData.name || `Run ${runs.length}`,
        build_name: buildNames.find((b) => b.id === formData.buildId)?.name as string,
      })
    }
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: `Run ${runs.length}` }))
  }, [runs])

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
                placeholder={`Run ${runs.length}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }}
                disableAnimation
                size='sm'
                variant='underlined'
                classNames={inputClassNames}
              />
            </div>
          </div>
          <Divider className='absolute bottom-0' />
        </div>

        {/* BUILD FIELD */}
        <div className='flex flex-col'>
          <div className='flex'>
            <div className='flex flex-col min-w-[100px]'>
              <div className='h-12 flex items-center mr-4'>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    fieldErrors.build ? "text-danger" : "text-neutral-500"
                  )}
                >
                  Build
                </span>
              </div>
            </div>
            <div className='flex flex-col basis-full w-0'>
              <div className='h-12 flex items-center justify-end'>
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
              </div>
            </div>
          </div>
          <Divider className={cn(fieldErrors.build && "bg-danger")} />
          {fieldErrors.build && <div className='text-danger text-xs mt-1'>{fieldErrors.build}</div>}
        </div>

        {/* PRESET FIELD */}
        <div className='flex flex-col'>
          <div className='flex '>
            <div className='flex flex-col min-w-[100px]'>
              <div className='h-12 flex items-center mr-4'>
                <span className='text-sm font-semibold text-neutral-500'>Preset</span>
              </div>
            </div>
            <div className='flex flex-col basis-full w-0'>
              <div className='h-12 flex items-center justify-end'>
                <Select
                  aria-label='Preset'
                  labelPlacement='outside'
                  defaultSelectedKeys={["None"]}
                  placeholder='No preset'
                  onChange={handlePresetChange}
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
          <Divider />
        </div>

        {/* TOKEN FIELD */}
        {tokenState.isTelegram && (
          <>
            <div className='flex flex-col'>
              <div className='flex'>
                <div className='flex flex-col min-w-[100px]'>
                  <div className='h-12 flex items-center mr-4'>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        !tokenState.isTokensAdding && fieldErrors.tokenName
                          ? "text-danger"
                          : "text-neutral-500"
                      )}
                    >
                      Token
                    </span>
                  </div>
                </div>
                <div className='flex flex-col basis-full w-0'>
                  <div className='h-12 flex items-center justify-end'>
                    <Select
                      aria-label='Token'
                      labelPlacement='outside'
                      placeholder='Select token'
                      onChange={handleTokenChange}
                      radius='sm'
                      size='sm'
                    >
                      {["New token", ...tokenState.tokens].map((item) => (
                        <SelectItem key={item}>{item}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <Divider
                className={cn(!tokenState.isTokensAdding && fieldErrors.tokenName && "bg-danger")}
              />
              {!tokenState.isTokensAdding && fieldErrors.tokenName && (
                <div className='text-danger text-xs mt-1'>{fieldErrors.tokenName}</div>
              )}
            </div>

            {tokenState.isTokensAdding && (
              <>
                <div className='flex flex-col'>
                  <div className='flex'>
                    <div className='flex flex-col min-w-[100px]'>
                      <div className='h-12 flex items-center mr-4'>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            fieldErrors.tokenName ? "text-danger" : "text-neutral-500"
                          )}
                        >
                          Token name
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-col basis-full w-0'>
                      <div className='h-12 flex items-center justify-end'>
                        <Input
                          placeholder='Enter Telegram token name'
                          value={formData.tokenName}
                          onChange={handleTokenNameChange}
                          disableAnimation
                          size='sm'
                          variant='underlined'
                          classNames={inputClassNames}
                        />
                      </div>
                    </div>
                  </div>
                  <Divider className={cn(fieldErrors.tokenName && "bg-danger")} />
                  {fieldErrors.tokenName && (
                    <div className='text-danger text-xs mt-1'>{fieldErrors.tokenName}</div>
                  )}
                </div>

                <div className='flex flex-col'>
                  <div className='flex'>
                    <div className='flex flex-col min-w-[100px]'>
                      <div className='h-12 flex items-center mr-4'>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            fieldErrors.tokenValue ? "text-danger" : "text-neutral-500"
                          )}
                        >
                          Token value
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-col basis-full w-0'>
                      <div className='h-12 flex items-center justify-end'>
                        <Input
                          placeholder='Enter Telegram token value'
                          value={formData.tokenValue}
                          onChange={handleTokenValueChange}
                          disableAnimation
                          size='sm'
                          variant='underlined'
                          classNames={inputClassNames}
                        />
                      </div>
                    </div>
                  </div>
                  <Divider />
                  {fieldErrors.tokenValue && (
                    <div className='text-danger text-xs mt-1'>{fieldErrors.tokenValue}</div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div>
        <Button
          onClick={handleStartRun}
          isDisabled={startingRunId !== null || !formData.buildId}
          className='font-semibold bg-foreground text-background rounded-lg w-full'
        >
          Run
        </Button>
      </div>
    </div>
  )
}

export default StartRunForm
