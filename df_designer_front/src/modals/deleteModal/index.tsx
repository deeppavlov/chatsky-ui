import React, { MouseEventHandler } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

type alertDeleteType = {
  onDelete: () => any
  title?: string
  description?: string
}

const AlertDelete = ({ onDelete, title='Are you absolutely sure?', description='This action cannot be undone.' }: alertDeleteType) => {
  return (
    <AlertDialog.Portal>
        <AlertDialog.Overlay className="z-50 bg-[#00000040] data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="z-50 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-background p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-foreground m-0 text-[17px] font-medium">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-foreground mt-4 mb-5 text-[15px] leading-normal">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialog.Cancel asChild>
              <button className="text-foreground transition-all bg-accent hover:bg-muted focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button onClick={onDelete} className="text-white transition-all bg-red-500 hover:bg-red-600 focus:shadow-red-100 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
  )
}

export default AlertDelete