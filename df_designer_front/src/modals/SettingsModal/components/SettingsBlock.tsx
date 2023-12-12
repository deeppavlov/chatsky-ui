import React, { ReactNode, useContext } from 'react'
import { AppearanceIcon } from '../../../icons/AppearanceIcon'
import { ThemeIcon } from '../../../icons/ThemeIcon'
import { darkContext } from '../../../contexts/darkContext'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { RussianLangIcon } from '../../../icons/RussianLangIcon'

export type SettingBlockSettingType = {
  title: string
  description: string
  Icon: Function
  children: any
}

export type SettingsBlockType = {
  title: string
  Icon: Function
  settings: SettingBlockSettingType[]
}

export const SettingsBlock = ({ title, Icon, settings }: SettingsBlockType) => {

  const { dark } = useContext(darkContext)

  const fill = dark ? "white" : "black"

  return (
    <div className="settings-block">
      <div className='settings-block-head pb-2 border-b border-neutral-500 border-opacity-30 '>
        <div className="flex flex-row items-center gap-1.5 ">
          <span className="flex flex-col items-center justify-center w-6 h-6">
            <Icon fill={fill} />
          </span>
          <h4 className="settings-title" > {title} </h4>
        </div>
        {/* <Separator className='w-full h-[1px] bg-white mt-2 ' /> */}
      </div>
      {settings.map((setting) => {
        return (
          <div className="settings-object" >
            <div className="flex flex-row items-center gap-1.5">
              <span className="settings-object-icon">
                <setting.Icon fill={fill} />
              </span>
              <h5 className="settings-object-title" > {setting.title} </h5>
            </div>
            <span className="settings-object-description" > {setting.description} </span>
            <div>
              {setting.children}
            </div>
          </div>
        )
      })}
    </div>
  )
}
