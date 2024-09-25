import { CompletionContext, autocompletion } from "@codemirror/autocomplete"
import { globalCompletion, python } from "@codemirror/lang-python"
import { indentUnit } from "@codemirror/language"
import { andromeda } from "@uiw/codemirror-theme-andromeda"
import { noctisLilac } from "@uiw/codemirror-theme-noctis-lilac"
import ReactCodeMirror from "@uiw/react-codemirror"
import React, { useContext, useEffect } from "react"
import { IdeContext } from "../../../contexts/ideContext"
import { themeContext } from "../../../contexts/themeContext"
import { responseType } from "../../../types/ResponseTypes"
import { responseEditorPlugin } from "../../ConditionModal/editorOptions"

const tabSize = "    "

const PythonResponse = ({
  response,
  setData,
}: {
  response: responseType
  setData: React.Dispatch<React.SetStateAction<responseType>>
}) => {
  const { theme } = useContext(themeContext)
  const { methods: dffMethods } = useContext(IdeContext)

  const firstString = `class ${response.name}(BaseResponse):`
  const secondString = `    async def call(self, ctx: Context) -> Message:`

  useEffect(() => {
    if (!response.data[0].python) {
      setData({
        ...response,
        type: "python",
        data: [
          {
            priority: 1,
            python: {
              action: `${firstString}\n${secondString}\n        return Message('Hello')`,
            },
          },
        ],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeResponseValue = (value: string) => {
    setData({
      ...response,
      type: "python",
      data: [
        {
          priority: 1,
          python: {
            action: `${firstString}\n${secondString}\n${value.split("\n").slice(2).join("\n")}`,
          },
        },
      ],
    })
  }

  useEffect(() => {
    if (response.data[0].python?.action) {
      setData({
        ...response,
        type: "python",
        data: [
          {
            priority: 1,
            python: {
              action: `${firstString}\n${secondString}\n${response.data[0].python.action.split("\n").slice(2).join("\n")}`,
            },
          },
        ],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response.name])

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
      options: [{ label: "cnd", type: "function", info: "DFF responses base methods object" }],
    }
  }

  return (
    <>
      <p className='text-sm font-medium'>Action</p>
      <div
        className={`mt-2 w-full flex flex-col items-start justify-start gap-4 p-4 ${theme === "light" ? "bg-[#f2f1f8]" : "bg-[#24262e]"} rounded-lg font-mono`}>
        <ReactCodeMirror
          data-testid='python-response-editor'
          style={{
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
          lang='python'
          extensions={[
            responseEditorPlugin,
            indentUnit.of(tabSize),
            autocompletion({
              override: [dffAutocomplete, globalCompletion, myCompletion],
              maxRenderedOptions: 10,
            }),
            python(),
          ]}
          value={response.data[0].python?.action}
          onChange={changeResponseValue}
          className='w-full border-none outline-none focus-within:outline-none focus:outline-none font-mono'
          theme={theme === "light" ? noctisLilac : andromeda}
          height='240px'
        />
      </div>
    </>
  )
}

export default PythonResponse
