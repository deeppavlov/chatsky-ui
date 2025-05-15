import General from '@/components/settings/General'
import Llms from '@/components/settings/Llms/Llms'
import { Button, Divider } from '@nextui-org/react'
import { capitalize } from 'lodash'
import { memo, ReactNode, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const tabsMap: Record<Tab, ReactNode> = {
  general: <General />,
  pipeline: null,
  llms: <Llms />,
  build: null,
  advanced: null,
}

type Tab = 'general' | 'pipeline' | 'llms' | 'build' | 'advanced'

const Settings = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab')?.toLowerCase() ?? 'general') as Tab

  const [currentTab, setCurrentTab] = useState<Tab>(tab)

  return (
    <>
      <div className='absolute left-0 top-0 h-screen w-screen bg-background px-10 pb-14 pt-24 transition-all duration-300'>
        <h2 className='mb-4 text-2xl font-semibold'>Settings</h2>
        <div className='grid h-full grid-cols-6 grid-rows-1 gap-8 pb-14'>
          <div className='col-span-1 flex w-full gap-4'>
            <div className='flex w-full flex-col items-start justify-start gap-1'>
              {Object.keys(tabsMap).map((key) => (
                <Button
                  key={key}
                  isDisabled={['pipeline', 'build', 'advanced'].includes(key)}
                  className='flex w-full items-center justify-start font-semibold text-text-secondary'
                  variant={tab === key ? 'flat' : 'light'}
                  onClick={() => {
                    setCurrentTab(key as Tab)
                    setSearchParams({ page: 'settings', tab: key })
                  }}
                >
                  {capitalize(key)}
                </Button>
              ))}
            </div>
            <Divider orientation='vertical' className='h-full' />
          </div>
          <div className='col-span-5'>{tabsMap[currentTab]}</div>
        </div>
      </div>
    </>
  )
})

export default Settings
