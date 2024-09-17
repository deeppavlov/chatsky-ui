import { Button, Divider, Select, SelectItem, Switch } from "@nextui-org/react"
import { MoonIcon, SunIcon } from "lucide-react"
import { memo, useContext } from "react"
import { themeContext } from "../contexts/themeContext"
import { workspaceContext } from "../contexts/workspaceContext"

const Settings = memo(() => {
  const { settingsPage } = useContext(workspaceContext)
  const { theme, toggleTheme } = useContext(themeContext)

  return (
    <>
      <div
        style={{
          transform: settingsPage ? "translateX(0)" : "translateX(100%)",
          // display: settingsPage ? "block" : "none",
        }}
        className='absolute top-0 left-0 transition-all duration-300 pt-24 pb-14 px-12 w-screen h-screen bg-background'>
        <h2 className='text-2xl font-semibold mb-4'>Settings</h2>
        <div className='grid grid-cols-6 gap-8 h-full pb-14'>
          <div className='col-span-1 w-full flex gap-4'>
            <div className='flex flex-col items-start justify-start gap-1 w-full'>
              <Button
                className='flex items-center justify-start w-full font-semibold'
                variant='flat'>
                Appearance
              </Button>
              <Button
                isDisabled
                className='flex items-center justify-start w-full font-semibold'
                variant='light'>
                Pipeline
              </Button>
              <Button
                isDisabled
                className='flex items-center justify-start w-full font-semibold'
                variant='light'>
                Build & Run
              </Button>
              <Button
                isDisabled
                className='flex items-center justify-start w-full font-semibold'
                variant='light'>
                Advanced
              </Button>
            </div>
            <Divider
              orientation='vertical'
              className='h-full'
            />
          </div>
          <div className='col-span-5'>
            <section className='mb-8'>
              <h3 className='text-xl font-semibold mb-2'>Theme</h3>
              <p className='mb-4 text-neutral-400'>
                Avoid eye fatigue by setting appropriate theme.
              </p>
              <div className='flex items-center gap-2'>
                {/* <span>Light</span> */}
                <Switch
                  defaultSelected={theme === "light"}
                  onChange={toggleTheme}
                  color='primary'
                  startContent={<SunIcon />}
                  endContent={<MoonIcon />}></Switch>
                {/* <span>Dark</span> */}
              </div>
            </section>
            <section className='mb-8'>
              <h3 className='text-xl font-semibold mb-4'>Language</h3>
              <Select
                aria-label='language-select'
                value={"en"}
                disabledKeys={["ru"]}
                defaultSelectedKeys={["en"]}
                className='w-48'
                size='sm'>
                <SelectItem
                  key={"en"}
                  value='en'>
                  English
                </SelectItem>
                <SelectItem
                  key={"ru"}
                  value='ru'>
                  Russian soon...
                </SelectItem>
              </Select>
            </section>
          </div>
        </div>
      </div>
    </>
  )
})

export default Settings
