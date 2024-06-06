import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { workspaceContext } from '../../../contexts/workspaceContext'
import { parseSearchParams } from '../../../utils'

const SettingsPageOpener = () => {


  const { setSettingsPage } = useContext(workspaceContext)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    setSettingsPage(true)
    setSearchParams({
      ...parseSearchParams(searchParams),
      settings: "opened"
    })

    return () => {
      setSettingsPage(false)
      setSearchParams({
        ...parseSearchParams(searchParams),
        settings: "closed"
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
    </>
  )
}

export default SettingsPageOpener