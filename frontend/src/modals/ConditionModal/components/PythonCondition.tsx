import { python } from "@codemirror/lang-python"
import { indentUnit } from '@codemirror/language'
import { andromeda } from "@uiw/codemirror-theme-andromeda"
import { noctisLilac } from "@uiw/codemirror-theme-noctis-lilac"
import CodeMirror from "@uiw/react-codemirror"
import React, { useContext, useEffect } from "react"
import { themeContext } from "../../../contexts/themeContext"
import { conditionType } from "../../../types/ConditionTypes"
import { firstLinePlugin } from "../editorOptions"
const tabSize = '    '

const PythonCondition = ({
  condition,
  setData,
}: {
  condition: conditionType
  setData: React.Dispatch<React.SetStateAction<conditionType>>
}) => {
  const { theme } = useContext(themeContext)

  const firstString = `def ${condition.name}(ctx: Context, pipeline: Pipeline) -> bool:`

  useEffect(() => {
    if (!condition.data.python) {
      setData({
        ...condition,
        type: "python",
        data: {
          ...condition.data,
          python: {
            action: `def ${condition.name}(ctx: Context, pipeline: Pipeline) -> bool:\n  # enter your python condition:\n    return True`,
          },
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeConditionValue = (value: string) => {
    setData({
      ...condition,
      type: "python",
      data: {
        ...condition.data,
        python: {
          action: `${firstString}\n${value.split("\n").slice(1).join("\n")}`,
        },
      },
    })
  }

  useEffect(() => {
    if (condition.data.python?.action) {
      setData({
        ...condition,
        type: "python",
        data: {
          ...condition.data,
          python: {
            action: `${firstString}\n${condition.data.python.action.split("\n").slice(1).join("\n")}`,
          },
        },
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.name])

  return (
    <>
      <p className='text-sm font-medium'>Action</p>
      <div
        className={`mt-2 w-full flex flex-col items-start justify-start gap-4 p-4 ${theme === "light" ? "bg-[#f2f1f8]" : "bg-[#24262e]"} rounded-lg font-mono`}>
        <CodeMirror
          data-testid='python-condition-editor'
          style={{
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
          lang='python'
          extensions={[python(), firstLinePlugin, indentUnit.of(tabSize)]}
          value={condition.data.python?.action}
          onChange={changeConditionValue}
          className='w-full border-none outline-none focus-within:outline-none focus:outline-none font-mono'
          theme={theme === "light" ? noctisLilac : andromeda}
          height='240px'
        />
      </div>
    </>
  )
}

export default PythonCondition
