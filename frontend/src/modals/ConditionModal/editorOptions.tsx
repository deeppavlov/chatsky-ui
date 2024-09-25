import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType
} from "@uiw/react-codemirror"

// Обобщенный виджет для отображения строк
class LineWidget extends WidgetType {
  content: string
  constructor(content: string) {
    super()
    this.content = content
  }

  eq(other: LineWidget): boolean {
    return other.content === this.content
  }

  toDOM() {
    const wrap = document.createElement("span")
    wrap.innerHTML = this.content
    return wrap
  }
}

// Метод для создания виджета с текстом для замены строк
function createWidget(content: string, startPos: number, length: number) {
  return Decoration.replace({
    widget: new LineWidget(content),
    side: 2,
    ignoreSelection: true,
  }).range(startPos, startPos + length)
}

// Метод для создания HTML-контента строки
function generateLineContent(type: "condition" | "response", line: "first" | "second", name: string): string {
  const baseType = type === "condition" ? "BaseCondition" : "BaseResponse"
  if (line === "first") {
    return `<span style="color: #999;">class</span> <span style="color: #999;">${name}</span>(<span style="color: #999;">${baseType}</span>):`
  }
  const returnType = type === "condition" ? "bool" : "Message"
  return `    <span style="color: #999;">def call</span>(<span style="color: #999;">self, ctx: Context</span>)<span style="color: #999;"> -> ${returnType}</span>:`
}

// Метод для обработки первой и второй строк
function twoLinesRange(view: EditorView, type: "condition" | "response") {
  const firstLineText = view.state.doc.line(1).text
  const secondLineText = view.state.doc.line(2).text
  const firstLineName = firstLineText.split("(")[0].split(" ")[1]

  // Декорации для первой и второй строк
  const firstLineDecoration = createWidget(generateLineContent(type, "first", firstLineName), 0, firstLineText.length)
  const secondLineDecoration = createWidget(generateLineContent(type, "second", firstLineName), firstLineText.length + 1, secondLineText.length)

  return Decoration.set([firstLineDecoration, secondLineDecoration])
}

// Обобщенный плагин
function createTwoLinesPlugin(type: "condition" | "response") {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet
      constructor(view: EditorView) {
        this.decorations = twoLinesRange(view, type)
      }
      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = twoLinesRange(update.view, type)
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  )
}

// Плагины для condition и response
export const conditionEditorPlugin = createTwoLinesPlugin("condition")
export const responseEditorPlugin = createTwoLinesPlugin("response")