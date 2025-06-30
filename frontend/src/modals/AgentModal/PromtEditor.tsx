import { autocompletion } from '@codemirror/autocomplete'
import { EditorView } from '@codemirror/view'
import ReactCodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { useContext } from 'react'
import { themeContext } from '../../contexts/themeContext'
import {
  createInputDecoration,
  myAutocomplete,
  previewState,
} from './editorPlugins'

interface IProps {
  placeholder?: string
  onChange?: (value: string) => void
  value: string
  codeEditorRef?: React.RefObject<ReactCodeMirrorRef>
  autocompletionWords?: string[]
  symbolAutocompletion?: string
}

export const TextEditor = ({
  onChange,
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

    // Стили для окна автозамены
    '.cm-tooltip-autocomplete': {
      maxHeight: '250px !important',
      overflowY: 'auto !important',
      color: 'red !important',
      // backgroundColor: backgroundColorTheme,
      border: '1px solid var(--border-color, #e0e0e0)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
    },

    '.cm-tooltip-autocomplete > ul': {
      margin: '0',
      padding: '8px 0',
      listStyle: 'none',
    },

    '.cm-tooltip-autocomplete > ul > li ': {
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },

    '.cm-tooltip-autocomplete > ul > li:hover': {
      backgroundColor: 'var(--hover-bg, rgba(102, 164, 195, 0.1))',
    },

    '.cm-tooltip-autocomplete > ul > li > span': {
      color: 'var(--selected-text, #333)',
    },

    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: 'var(--selected-bg, rgba(51, 153, 204, 0.2))',
      color: 'var(--selected-text, #333)',
      fontWeight: '500',
    },

    '.cm-tooltip-autocomplete::-webkit-scrollbar': {
      width: '6px',
    },

    '.cm-tooltip-autocomplete::-webkit-scrollbar-track': {
      background: 'transparent',
    },

    '.cm-tooltip-autocomplete::-webkit-scrollbar-thumb': {
      background: 'var(--scrollbar-color, #c0c0c0)',
      borderRadius: '3px',
    },

    '.cm-tooltip-autocomplete::-webkit-scrollbar-thumb:hover': {
      background: 'var(--scrollbar-hover-color, #a0a0a0)',
    },
    '.widget-input': {
      background:
        theme === 'light' ? 'rgba(51, 153, 204, 0.10)' : 'rgb(63, 63, 70)',
      padding: '2px 4px 2px 4px',
    },
    '.cm-preview-widget': {
      color: 'grey',
      opacity: '0.6',
      pointerEvents: 'none',
      fontStyle: 'italic',
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      borderRadius: '3px',
      padding: '0 2px',
    },
  })

  return (
    <div
      className={`flex h-full w-full flex-col items-start justify-start gap-4 rounded-lg border border-input-border p-4 font-mono`}
    >
      <ReactCodeMirror
        key={theme}
        placeholder={placeholder}
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
          previewState,
        ]}
        value={value}
        onChange={onChange}
        className='w-full border-none font-mono outline-none focus-within:outline-none focus:outline-none'
        theme={myTheme}
        height='240px'
      />
    </div>
  )
}
