import { useContext, useEffect } from 'react'
import { buildContext } from '../../../contexts/buildContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { parseSearchParams } from '../../../utils'
import { workspaceContext } from '../../../contexts/workspaceContext'

const SettingsPageOpener = () => {


  const { setSettingsPage } = useContext(workspaceContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

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
  }, [])

  return (
    <>
    </>
  )
}

export default SettingsPageOpener