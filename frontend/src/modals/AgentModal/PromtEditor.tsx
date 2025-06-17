import { autocompletion } from '@codemirror/autocomplete'
import { EditorView } from '@codemirror/view'
import ReactCodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useContext } from 'react'
import { themeContext } from '../../contexts/themeContext'
import { createInputDecoration, myAutocomplete } from './editorPlugins'

interface IProps {
  placeholder?: string
  onChange?: (value: string) => void
  // onBlur?: () => void
  value: string
  codeEditorRef?: React.RefObject<ReactCodeMirrorRef>
  autocompletionWords?: string[]
  symbolAutocompletion?: string
}

export const TextEditor = ({
  onChange,
  // onBlur,
  placeholder,
  value,
  codeEditorRef,
  autocompletionWords,
  symbolAutocompletion = '@',
}: IProps) => {
  const { theme } = useContext(themeContext)

  const myTheme = EditorView.theme({
    '.cm-content': {
      fontFamily: 'Inter,sans-serif',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '160%',
      fontSize: '16px',
      color: 'red !important',
    },

    '.cm-activeLine': {
      backgroundColor: 'transparent',
    },
    '&.ͼ1.cm-focused': {
      outline: 'none',
    },

    '.ͼ5p': {
      height: '100%',
    },
    '&.ͼ4 .cm-line': {
      fontFamily: 'Inter,sans-serif',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '160%',
      fontSize: '16px',
    },
    '.cm-cursor': {
      borderLeft: '2px solid var(--input-border-focus)',
    },
    '.cm-tooltip-autocomplete': {
      maxHeight: '250px !important',
      overflowY: 'auto !important',
      color: 'red !important',
      backgroundColor: theme === 'light' ? '#f2f1f8' : '#24262e',
    },
  })

  const baseTheme = EditorView.baseTheme({
    '.widget-input': {
      color: 'blue',
    },
  })

  return (
    <>
      <div
        className={`mt-2 flex w-full flex-col items-start justify-start gap-4 p-4 ${theme === 'light' ? 'bg-[#f2f1f8]' : 'bg-[#24262e]'} rounded-lg font-mono`}
      >
        <ReactCodeMirror
          ref={codeEditorRef}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightSelectionMatches: false,
            highlightActiveLine: false,
          }}
          data-testid='prompt-editor'
          style={{
            fontFamily:
              'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
          }}
          extensions={[
            EditorView.lineWrapping,
            autocompletion({
              override: [
                myAutocomplete(
                  autocompletionWords || [],
                  symbolAutocompletion || '@',
                ),
              ],
            }),
            createInputDecoration(autocompletionWords || []),

            baseTheme,
          ]}
          value={value}
          onChange={onChange}
          className='w-full border-none font-mono outline-none focus-within:outline-none focus:outline-none'
          theme={myTheme}
          height='240px'
        />
      </div>
    </>
  )
}
