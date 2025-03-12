import { Button, Divider, Select, SelectItem, Switch } from '@nextui-org/react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { memo, useContext } from 'react'
import { themeContext } from '../contexts/themeContext'
import { workspaceContext } from '../contexts/workspaceContext'

const Settings = memo(() => {
  const { currentPage } = useContext(workspaceContext)
  const { theme, toggleTheme } = useContext(themeContext)

  return (
    <>
      <div
        style={{
          transform:
            currentPage === 'settings' ? 'translateX(0)' : 'translateX(100%)',
          // display: settingsPage ? "block" : "none",
        }}
        className='absolute left-0 top-0 h-screen w-screen bg-background px-12 pb-14 pt-24 transition-all duration-300'
      >
        <h2 className='mb-4 text-2xl font-semibold'>Settings</h2>
        <div className='grid h-full grid-cols-6 gap-8 pb-14'>
          <div className='col-span-1 flex w-full gap-4'>
            <div className='flex w-full flex-col items-start justify-start gap-1'>
              <Button
                className='flex w-full items-center justify-start font-semibold'
                variant='flat'
              >
                Appearance
              </Button>
              <Button
                isDisabled
                className='flex w-full items-center justify-start font-semibold'
                variant='light'
              >
                Pipeline
              </Button>
              <Button
                isDisabled
                className='flex w-full items-center justify-start font-semibold'
                variant='light'
              >
                Build & Run
              </Button>
              <Button
                isDisabled
                className='flex w-full items-center justify-start font-semibold'
                variant='light'
              >
                Advanced
              </Button>
            </div>
            <Divider orientation='vertical' className='h-full' />
          </div>
          <div className='col-span-5'>
            <section className='mb-8'>
              <h3 className='mb-2 text-xl font-semibold'>Theme</h3>
              <p className='mb-4 text-neutral-400'>
                Avoid eye fatigue by setting appropriate theme.
              </p>
              <div className='flex items-center gap-2'>
                {/* <span>Light</span> */}
                <Switch
                  defaultSelected={theme === 'light'}
                  onChange={toggleTheme}
                  color='primary'
                  startContent={<SunIcon />}
                  endContent={<MoonIcon />}
                ></Switch>
                {/* <span>Dark</span> */}
              </div>
            </section>
            <section className='mb-8'>
              <h3 className='mb-4 text-xl font-semibold'>Language</h3>
              <Select
                aria-label='language-select'
                value={'en'}
                disabledKeys={['ru']}
                defaultSelectedKeys={['en']}
                className='w-48'
                size='sm'
              >
                <SelectItem key={'en'} value='en'>
                  English
                </SelectItem>
                <SelectItem key={'ru'} value='ru'>
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
