import classNames from 'classnames'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import { FlowType } from '../../types/FlowTypes'

const FlowItem = ({
  flow,
  activeFlow,
}: {
  flow: FlowType
  flows: FlowType[]
  activeFlow: string
}) => {
  const navigate = useNavigate()
  const { flows: contextFlows } = useContext(flowContext)

  return (
    <>
      {flow ? (
        <div data-testid={`flowItem-${flow.name}`} className='w-full'>
          <div
            key={flow.name}
            onClick={() => {
              if (flow.name !== 'Global') navigate(`/app/flow/${flow.name}`)
            }}
            className={classNames(
              'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1',
              flow.name === 'Global' && 'mb-2',
              flow.name === activeFlow && 'bg-bg-secondary',
            )}
          >
            <span
              style={{
                backgroundColor: flow.color ?? '#999',
              }}
              className='block min-h-4 min-w-4 rounded-full'
            ></span>
            <p>
              {flow?.name}
              {flow?.name === 'Global' && (
                <span className='text-xs'> (in progress)</span>
              )}
            </p>
          </div>
          <div className='pl-3'>
            {contextFlows.filter((f) => f.subflow === flow.name).length > 0 && (
              <div className='border-l pl-1'>
                {contextFlows
                  .filter((f) => f.subflow === flow.name)
                  .map((f) => (
                    <FlowItem
                      key={f.name}
                      flow={f}
                      activeFlow={activeFlow}
                      flows={contextFlows}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>error</p>
      )}
    </>
  )
}

export default FlowItem
