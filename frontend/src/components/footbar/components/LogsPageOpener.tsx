import { useContext, useEffect } from 'react'
import { buildContext } from '../../../contexts/buildContext'
import { useSearchParams } from 'react-router-dom'
import { parseSearchParams } from '../../../utils'

const LogsPageOpener = () => {

  const { setLogsPage, logsPage } = useContext(buildContext)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    setLogsPage(true)
    setSearchParams({
      ...parseSearchParams(searchParams),
      logs_page: "opened"
    })

    return () => {
      setLogsPage(false)
      setSearchParams({
        ...parseSearchParams(searchParams),
        logs_page: "closed"
      })
    }
  }, [])

  return (
    <>
    </>
  )
}

export default LogsPageOpener