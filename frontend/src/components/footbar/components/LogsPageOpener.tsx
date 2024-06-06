import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buildContext } from '../../../contexts/buildContext'
import { parseSearchParams } from '../../../utils'

const LogsPageOpener = () => {

  const { setLogsPage } = useContext(buildContext)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
    </>
  )
}

export default LogsPageOpener