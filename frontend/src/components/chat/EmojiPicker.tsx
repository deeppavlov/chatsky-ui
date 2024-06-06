import React, { useDeferredValue, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import useLocalStorage from '../../hooks/useLocalStorage'

export type EmojiType = {
  slug: string
  character: string
  unicodeName: string
  codePoint: string
  group: string
  subGroup: string
}

type onEmojiClickType = (
  emoji: string,
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => void

export type emojiPickerType = {
  data: EmojiType[]
  lazy?: boolean
  theme?: 'dark' | 'light' | 'auto'
  onEmojiClick?: onEmojiClickType
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EmojiPicker = ({ data, lazy = false, theme = 'auto', onEmojiClick }: emojiPickerType) => {
  const [visibleData, setVisibleData] = useState<EmojiType[]>(useDeferredValue(data.slice(0, 84)))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [limit, setLimit] = useState<{
    up: number
    down: number
  }>({ up: 0, down: 84 })
  const [recently, setRecently] = useLocalStorage<EmojiType[]>('recently', [])

  useEffect(() => {
    setVisibleData(() => data.slice(0, 84))
  }, [data])

  const observerElement_1 = useInView()
  const observerElement_2 = useInView()

  const recentlyHandler = (emoji: EmojiType) => {
    if (recently.some((e) => e.character === emoji.character)) {
      setRecently((prev) => [emoji, ...prev.filter((e) => e.character !== emoji.character)])
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setRecently((prev) => [visibleData.find((e) => e.character === emoji.character), ...prev].slice(0, 10))
    }
  }

  useEffect(() => {
    if (observerElement_1.inView) {
      setLimit((prevLimit) => {
        return {
          up: prevLimit.up + 25,
          down: prevLimit.down + 40,
        }
      })
      setVisibleData((prev) => [...prev, ...data.slice(prev.length, prev.length + 40)])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observerElement_1.inView])

  useEffect(() => {
    if (observerElement_2.inView && visibleData.length > 100 && !observerElement_1.inView) {
      setVisibleData((prev) => data.slice(0, prev.length - 35))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observerElement_2.inView])

  return (
    <div className="flex h-[244px] w-max flex-col items-center justify-start gap-2.5 overflow-y-scroll rounded-lg bg-background p-1 pt-1 ">
      <div>
        <p className="ml-1 block w-full text-neutral-500">Recently used</p>
        <div className="grid grid-cols-5 flex-wrap justify-evenly gap-0.5 ">
          {recently?.map((emoji) => (
            <button
              key={emoji.character}
              onClick={(e) => {
                onEmojiClick && onEmojiClick(emoji.character, e);
                recentlyHandler(emoji)
              }}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-lg p-1 text-3xl transition hover:bg-accent">
              {emoji.character}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="ml-1 block w-full text-neutral-500">Emoji</p>
        <div className="grid grid-cols-5 flex-wrap justify-evenly gap-0.5 ">
          {visibleData?.map((emoji, index) => (
            <button
              key={emoji.character}
              ref={
                index === visibleData.length - 7
                  ? observerElement_1.ref
                  : index === visibleData.length - 168
                  ? observerElement_2.ref
                  : null
              }
              onClick={(e) => {
                onEmojiClick && onEmojiClick(emoji.character, e);
                recentlyHandler(emoji)
              }}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-lg p-1 text-3xl transition hover:bg-accent">
              {emoji.character}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmojiPicker
