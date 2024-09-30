import { CompletionContext, autocompletion } from "@codemirror/autocomplete"
import { globalCompletion, python } from "@codemirror/lang-python"
import { indentUnit } from "@codemirror/language"
import { andromeda } from "@uiw/codemirror-theme-andromeda"
import { noctisLilac } from "@uiw/codemirror-theme-noctis-lilac"
import ReactCodeMirror from "@uiw/react-codemirror"
import { useContext, useEffect } from "react"
import { IdeContext } from "../../../contexts/ideContext"
import { themeContext } from "../../../contexts/themeContext"
import { ConditionModalContentType } from "../ConditionModal"
import { conditionEditorPlugin } from "../editorOptions"

const tabSize = "    "

const PythonCondition = ({ condition, setData }: ConditionModalContentType) => {
  const { theme } = useContext(themeContext)
  const { methods: dffMethods } = useContext(IdeContext)

  const firstString = `class ${condition.name}(BaseCondition):`
  const secondString = `    async def call(self, ctx: Context) -> bool:`

  useEffect(() => {
    if (!condition.data.python) {
      setData({
        ...condition,
        type: "python",
        data: {
          ...condition.data,
          python: {
            action: `${firstString}\n${secondString}\n        return True`,
          },
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.name])

  useEffect(() => {
    if (condition.data.python?.action) {
      setData({
        ...condition,
        type: "python",
        data: {
          ...condition.data,
          python: {
            action: `${firstString}\n${secondString}\n${condition.data.python.action.split("\n").slice(2).join("\n")}`,
          },
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition.name])

  const changeConditionValue = (value: string) => {
    setData({
      ...condition,
      type: "python",
      data: {
        ...condition.data,
        python: {
          action: `${firstString}\n${secondString}\n${value.split("\n").slice(2).join("\n")}`,
        },
      },
    })
  }

  // useEffect(() => {
  //   console.log(condition.data.python?.action)
  // }, [condition])

  function dffAutocomplete(context: CompletionContext) {
    const word = context.matchBefore(/\b(?:cnd)\.\w*/)
    if (!word) return null
    if (word.from === word.to && !context.explicit) return null

    const options = dffMethods

    return {
      from: word.from,
      options,
      validFor: /^\w*$/,
    }
  }

  function myCompletion(context: CompletionContext) {
    const word = context.matchBefore(/\w*/)
    if (!word) return null
    if (word.from == word.to && !context.explicit) return null
    return {
      from: word.from,
      options: [{ label: "cnd", type: "function", info: "Chatsky conditions base methods object" }],
    }
  }

  return (
    <>
      <p className='text-sm font-medium'>Action</p>
      <div
        className={`mt-2 w-full flex flex-col items-start justify-start gap-4 p-4 ${theme === "light" ? "bg-[#f2f1f8]" : "bg-[#24262e]"} rounded-lg font-mono`}>
        <ReactCodeMirror
          data-testid='python-condition-editor'
          style={{
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
          lang='python'
          extensions={[
            conditionEditorPlugin,
            indentUnit.of(tabSize),
            autocompletion({
              override: [dffAutocomplete, globalCompletion, myCompletion],
              maxRenderedOptions: 10,
            }),
            python(),
          ]}
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
