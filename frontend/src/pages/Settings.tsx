import General from '@/components/settings/General'
import Llms from '@/components/settings/Llms/Llms'
import { Button, Divider } from '@nextui-org/react'
import { memo, ReactNode, useState } from 'react'

const tabsMap: Record<Tab, ReactNode> = {
  General: <General />,
  Pipeline: null,
  Llms: <Llms />,
  Build: null,
  Advanced: null,
}

type Tab = 'General' | 'Pipeline' | 'Llms' | 'Build' | 'Advanced'

const Settings = memo(() => {
  const [tab, setTab] = useState<Tab>('Llms')

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
                  isDisabled={['Pipeline', 'Build', 'Advanced'].includes(key)}
                  className='flex w-full items-center justify-start font-semibold text-text-secondary'
                  variant={tab === key ? 'flat' : 'light'}
                  onClick={() => {
                    setTab(key as Tab)
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>
            <Divider orientation='vertical' className='h-full' />
          </div>
          <div className='col-span-5'>{tabsMap[tab]}</div>
        </div>
      </div>
    </>
  )
})

export default Settings
