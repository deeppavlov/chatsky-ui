import { CompletionContext, Completion } from '@codemirror/autocomplete'
import {
  Decoration,
  EditorView,
  hoverTooltip,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@uiw/react-codemirror'

// export const wordHover = hoverTooltip((view, pos, side) => {
//   let { from, to, text } = view.state.doc.lineAt(pos)
//   let start = pos,
//     end = pos
//   while (start > from && /\w/.test(text[start - from - 1])) start--
//   while (end < to && /\w/.test(text[end - from])) end++
//   const word =
//     start - from === end - from ? text.slice(start - from, end - from + 12) : ''
//   if (word !== '[YOUR INPUT]') {
//     return null
//   }
//   return {
//     pos: start,
//     end,
//     above: true,
//     create() {
//       let dom = document.createElement('div')
//       dom.textContent = 'вместо [YOUR INPUT] укажите свое значение'
//       return { dom }
//     },
//   }
// })

class PlaceholderWidget extends WidgetType {
  label: string
  constructor(label: string) {
    super()
    this.label = label
  }

  eq(other: PlaceholderWidget): boolean {
    return other.label === this.label
  }

  toDOM() {
    const wrap = document.createElement('span')
    wrap.className = 'widget-input'
    wrap.innerHTML = this.label
    return wrap
  }
}

export const createInputDecoration = (keywords: string[]) => {
  const placeholderInput = new MatchDecorator({
    regexp: new RegExp(`(${keywords.join('|')})`, 'g'),
    decoration: (match) =>
      Decoration.replace({
        widget: new PlaceholderWidget(match[0]),
      }),
  })

  return ViewPlugin.fromClass(
    class {
      decorations

      constructor(view: EditorView) {
        this.decorations = placeholderInput.createDeco(view)
      }

      update(update: ViewUpdate) {
        this.decorations = placeholderInput.updateDeco(update, this.decorations)
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none
        }),
    },
  )
}

export const myAutocomplete =
  (keywords: string[], symbolAutocompletion: string) =>
  (context: CompletionContext) => {
    const before = context.matchBefore(
      new RegExp(`\\${symbolAutocompletion}[^\\${symbolAutocompletion}\\s]*$`),
    )
    if (!before) {
      return null
    }

    return {
      from: before.from + 1,
      to: before.to,
      options: keywords.map((keyword) => ({
        label: keyword,
        type: 'keyword',
        // Здесь вы можете добавить любое действие после вставки:
        apply: (view: EditorView, completion: Completion, from: number, to: number) => {
          const newFrom = from - 1
          const newTo = to
          view.dispatch({
            changes: { from: newFrom, to: newTo, insert: keyword },
          })
        },
      })),
      validFor: new RegExp(
        `\\${symbolAutocompletion}[^\\${symbolAutocompletion}\\s]*$`,
      ),
    }
  }
