'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import cn from 'classnames'
import { motion } from 'framer-motion'
import * as React from 'react'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = React.useState<{
    width: number
    left: number
  } | null>(null)

  const updateActiveTabPosition = React.useCallback(() => {
    if (!containerRef.current) return

    const activeTrigger = containerRef.current.querySelector(
      '[data-state="active"][data-slot="tabs-trigger"]',
    )

    if (activeTrigger instanceof HTMLElement) {
      setActiveTab({
        width: activeTrigger.offsetWidth,
        left: activeTrigger.offsetLeft,
      })
    }
  }, [])

  React.useEffect(() => {
    updateActiveTabPosition()

    const observer = new MutationObserver(() => {
      updateActiveTabPosition()
    })

    if (containerRef.current) {
      const triggers = containerRef.current.querySelectorAll(
        '[data-slot="tabs-trigger"]',
      )
      triggers.forEach((trigger) =>
        observer.observe(trigger, {
          attributes: true,
          attributeFilter: ['data-state'],
        }),
      )
    }

    return () => observer.disconnect()
  }, [updateActiveTabPosition])

  return (
    <TabsPrimitive.List
      ref={containerRef}
      data-slot='tabs-list'
      className={cn(
        'bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg',
        className,
      )}
      {...props}
    >
      <AnimatedTabsBorder activeTab={activeTab} />
      {children}
    </TabsPrimitive.List>
  )
}

function AnimatedTabsBorder({
  activeTab,
}: {
  activeTab: { width: number; left: number } | null
}) {
  if (!activeTab || activeTab.width === 0) return null
  return (
    <motion.div
      className='absolute bottom-0 left-0 z-0 h-full rounded-lg border border-contrast-border bg-background'
      initial={{
        width: activeTab.width,
        x: activeTab.left,
        opacity: 0,
      }}
      animate={{
        width: activeTab.width,
        x: activeTab.left,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        mass: 0.3,
      }}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-md z-10 inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1 font-normal text-text transition-[color,box-shadow] hover:opacity-50 focus-visible:outline-1 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-40 data-[state=active]:opacity-100 [&_svg:not([class*='size-'])]:size-6 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
