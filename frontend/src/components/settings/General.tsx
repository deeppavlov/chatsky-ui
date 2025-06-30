import { themeContext } from '@/contexts/themeContext'
import Switch from '@/UI/Switch'
import { Select, SelectItem } from '@nextui-org/react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useContext } from 'react'

const General = () => {
  const { theme, toggleTheme } = useContext(themeContext)
  return (
    <>
      <section className='mb-8'>
        <h3 className='mb-2 text-xl font-semibold'>Theme</h3>
        <p className='mb-4 text-neutral-400'>
          Avoid eye fatigue by setting appropriate theme.
        </p>
        <div className='flex items-center gap-2'>
          <Switch
            checked={theme === 'light'}
            onChange={toggleTheme}
            className='data-[state=checked]:bg-blue-500'
            startContent={<SunIcon color='#000' className='h-3.5 w-3.5' />}
            endContent={<MoonIcon color='#000' className='h-3.5 w-3.5' />}
          />
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
    </>
  )
}

export default General
