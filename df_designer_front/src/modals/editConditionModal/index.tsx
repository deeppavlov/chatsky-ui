import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, conditionEditableTypes, condition_actions, condition_intents, condition_llms, condition_variables, limitScrollFieldsModal } from "../../utils";
import { typesContext } from "../../contexts/typesContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ToggleShadComponent from "../../components/toggleShadComponent";
import InputListComponent from "../../components/inputListComponent";
import TextAreaComponent from "../../components/textAreaComponent";
import InputComponent from "../../components/inputComponent";
import FloatComponent from "../../components/floatComponent";
import Dropdown from "../../components/dropdownComponent";
import IntComponent from "../../components/intComponent";
import InputFileComponent from "../../components/inputFileComponent";
import PromptAreaComponent from "../../components/promptComponent";
import CodeAreaComponent from "../../components/codeAreaComponent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Text, Variable } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { DragIcon } from "../../icons/DragIcon";
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { TabsContext } from "../../contexts/tabsContext";
import { HelpBtn } from "../../components/ui/helpbtn";
import { LLM_cnd_icon } from "../../icons/LLMConditionIcon";
import { Custom_cnd_icon } from "../../icons/CustomConditionIcon";
import { Title } from "@radix-ui/react-dialog";
import { PlayIcon } from "../../icons/PlayIcon";
import { Play2Icon } from "../../icons/Play2Icon";
import * as Tabs from '@radix-ui/react-tabs'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import AlertDelete from "../deleteModal";
import { TypeOfConditionEditableType } from "../../types/components";
import CodeEditor from '@uiw/react-textarea-code-editor';
import CodeMirror from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import { darkContext } from "../../contexts/darkContext";
import { SlotFillingConditionIcon } from "../../icons/SlotFillingConditionIcon";
import { python, pythonLanguage } from '@codemirror/lang-python'
import { copilot } from '@uiw/codemirror-theme-copilot'
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac'
import { localCompletionSource, globalCompletion } from "@codemirror/lang-python";
import { completeFromList, CompletionContext, autocompletion } from '@codemirror/autocomplete'
import { tags as t } from '@lezer/highlight';
import { syntaxTree } from "@codemirror/language"
import { historyField } from '@codemirror/commands';


const stateFields = { history: historyField };



export default function EditConditionModal({ data, conditionID }: { data: NodeDataType, conditionID: number }) {

  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { dark } = useContext(darkContext)
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const [custom, setCustom] = useState(true);
  const [conditionEditableType, setConditionEditableType] = useState<TypeOfConditionEditableType>(conditionEditableTypes.custom)

  const myThemeLight = createTheme({
    theme: 'light',
    settings: {
      background: 'hsl(var(--muted))',
      backgroundImage: '',
      foreground: '#4D4D4C',
      caret: '#AEAFAD',
      selection: '#D6D6D6',
      selectionMatch: '#D6D6D6',
      gutterBackground: 'hsl(var(--muted))',
      gutterForeground: '#4D4D4C',
      gutterBorder: '#dddddd',
      gutterActiveForeground: '',
      lineHighlight: '#EFEFEF',
    },
    styles: [
      { tag: t.comment, color: '#787b80' },
      { tag: t.name, color: '#00cc99' },
      { tag: t.definition(t.typeName), color: '#194a7b' },
      { tag: t.typeName, color: '#194a7b' },
      { tag: t.standard(t.typeName), color: '#194a7b' },
      { tag: t.tagName, color: '#008a02' },
      { tag: t.variableName, color: '#00cc99' },
      { tag: t.definition(t.variableName), color: '#0400ff' },
      { tag: t.function(t.variableName), color: '#001eff' },
      { tag: t.propertyName, color: '#ffa200' },
      { tag: t.function(t.propertyName), color: '#ffbb00' },
      { tag: t.definition(t.propertyName), color: '#ff0000' },
      { tag: t.special(t.propertyName), color: '#ff0000' },
      { tag: t.attributeName, color: '#ffa200' },
      { tag: t.className, color: '#ff0000' },
      { tag: t.namespace, color: '#000000' },
      { tag: t.string, color: '#ff0000' },
      { tag: t.special(t.string), color: '#ff0000' },
      { tag: t.attributeValue, color: '#ff0000' },
      { tag: t.operatorKeyword, color: '#ffd500' },
      { tag: t.controlKeyword, color: '#c01b1b' },
      { tag: t.definitionKeyword, color: '#ff8800' },
      { tag: t.moduleKeyword, color: '#ff0000' },
      { tag: t.operator, color: '#000000' },
    ],
  });

  const myThemeDark = createTheme({
    theme: 'light',
    settings: {
      background: 'hsl(var(--muted))',
      backgroundImage: '',
      foreground: 'hsl(var(--foreground))',
      caret: '#AEAFAD',
      selection: '#000',
      selectionMatch: '#000',
      gutterBackground: 'hsl(var(--muted))',
      gutterForeground: '#4D4D4C',
      gutterBorder: 'hsl(var(--border))',
      gutterActiveForeground: '',
      lineHighlight: '#000',
    },
    styles: [
      { tag: t.comment, color: '#787b80' },
      { tag: t.name, color: '#00cc99' },
      { tag: t.definition(t.typeName), color: '#194a7b' },
      { tag: t.typeName, color: '#194a7b' },
      { tag: t.standard(t.typeName), color: '#194a7b' },
      { tag: t.tagName, color: '#008a02' },
      { tag: t.variableName, color: '#00cc99' },
      { tag: t.definition(t.variableName), color: '#0400ff' },
      { tag: t.function(t.variableName), color: '#001eff' },
      { tag: t.propertyName, color: '#ffa200' },
      { tag: t.function(t.propertyName), color: '#ffbb00' },
      { tag: t.definition(t.propertyName), color: '#ff0000' },
      { tag: t.special(t.propertyName), color: '#ff0000' },
      { tag: t.attributeName, color: '#ffa200' },
      { tag: t.className, color: '#ff0000' },
      { tag: t.namespace, color: '#000000' },
      { tag: t.string, color: '#ff0000' },
      { tag: t.special(t.string), color: '#ff0000' },
      { tag: t.attributeValue, color: '#ff0000' },
      { tag: t.operatorKeyword, color: '#ffd500' },
      { tag: t.controlKeyword, color: '#ff0000' },
      { tag: t.definitionKeyword, color: '#ff8800' },
      { tag: t.moduleKeyword, color: '#ff0000' },
      { tag: t.operator, color: '#000000' },
    ],
  });


  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }
  useEffect(() => { }, [closePopUp, data.node.template]);

  let conditions = data.node.conditions.length ? data.node.conditions : null
  const condition = data.node?.conditions.find((cond) => conditionID === cond.conditionID) ?? null

  const [title, setTitle] = useState(condition?.name ? condition.name : '')
  // const [intent, setIntent] = useState(condition?.intent ? condition.intent : '')
  // const [action, setAction] = useState(condition?.action ? condition.action : '')
  // const [variables, setVariables] = useState(condition?.variables ? condition.variables : '')
  const [llm_model, setLLM_Model] = useState(condition?.llm_model ? condition.llm_model : '')
  const [api_key, setApi_key] = useState(condition?.APIKey ? condition.APIKey : '')
  const [prompt, setPrompt] = useState(condition?.prompt ? condition.prompt : '')
  const [code, setCode] = useState<string>(condition?.action ?? '')
  const [autocompleteAdditions, setAutocompleteAdditions] = useState(JSON.parse(localStorage.getItem('storage_functions')) ?? [])

  const [promptTestWindow, setPromptTestWindow] = useState(false)
  const [isSatisfied, setIsSatisfied] = useState(false)


  const [conditionsState, setConditionsState] = useState(conditions)



  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (conditionEditableType === conditionEditableTypes.custom) {
      condition.prompt = ''
      condition.APIKey = ''
      condition.llm_model = ''
      condition.name = title
      // condition.intent = intent
      condition.action = code
      // condition.variables = variables
    } else if (conditionEditableType === conditionEditableTypes.using_llm) {
      condition.prompt = prompt
      condition.APIKey = api_key
      condition.llm_model = llm_model
      condition.name = title
      condition.intent = ''
      condition.action = ''
      condition.variables = ''
    } else if (conditionEditableType === conditionEditableTypes.slot_filling) {
      // condition.prompt = prompt
      // condition.APIKey = api_key
      // condition.llm_model = llm_model
      // condition.name = title
      // condition.intent = ''
      // condition.action = ''
      // condition.variables = ''
    }
    saveFlow(savedFlow);
    closePopUp();
  }

  const onDelete = () => {
    closePopUp()
    data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID);
    setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID));
  }

  function myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/)
    if (word.from == word.to && !context.explicit)
      return null
    return {
      from: word.from,
      options: [
        ...autocompleteAdditions.map((addition: { name: string; description: string; func: string }) => {
          return {
            label: addition.name,
            type: 'variable',
            apply: addition.description,
            info: addition.func
          }
        }),
        { label: 'dff', type: 'variable', apply: 'dff_function(name)', detail: 'dff_function', info: 'dff_function(name:string)' }
      ]
    }
  }

  const [myLang, setMyLang] = useState(pythonLanguage.data.of({
    autocomplete: myCompletions
  }))
  


  return (
    <Tabs.Root defaultValue={conditionEditableTypes.custom}>
      <AlertDialog.Root>
        <Dialog open={true} onOpenChange={setModalOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className={`sm:max-w-[600px] ${promptTestWindow ? "lg:max-w-[960px]" : "lg:max-w-[700px]"} flex flex-row transition-all duration-500 `}>
            <div className="w-full flex flex-col justify-between">
              <div className=" w-full flex flex-col items-start justify-start ">
                <DialogHeader className="flex flex-row justify-start items-start gap-6">
                  <DialogTitle>
                    <span className="flex flex-row items-center mb-2">
                      <EditConditionIcon fill="var(--text)" />
                      <p className="ml-1">Edit Conditions</p>
                    </span>
                    <Badge variant="secondary" > {data.id} | {condition.name ? condition.name : 'noname'} </Badge>
                  </DialogTitle>
                  <Tabs.List className="storage-modal-tab-list">
                    <Tabs.Trigger onClick={e => setConditionEditableType(conditionEditableTypes.custom)} className="storage-modal-tab-trigger w-36 data-[state=active]:storage-modal-tab-trigger-active " value={conditionEditableTypes.custom}>
                      {/* <ComponentsIcon /> */}
                      <Custom_cnd_icon />
                      Custom
                    </Tabs.Trigger>
                    <Tabs.Trigger onClick={e => setConditionEditableType(conditionEditableTypes.slot_filling)} className="storage-modal-tab-trigger w-36 data-[state=active]:storage-modal-tab-trigger-active " value={conditionEditableTypes.slot_filling} >
                      {/* <Custom_cnd_icon opacity="0.7" /> */}
                      <SlotFillingConditionIcon />
                      Slot filling
                    </Tabs.Trigger>
                    <Tabs.Trigger onClick={e => setConditionEditableType(conditionEditableTypes.using_llm)} className="storage-modal-tab-trigger w-36 data-[state=active]:storage-modal-tab-trigger-active " value={conditionEditableTypes.using_llm}>
                      {/* <MyStoragePresetsIcon /> */}
                      <LLM_cnd_icon />
                      Using LLM
                    </Tabs.Trigger>
                  </Tabs.List>
                </DialogHeader>
                <div className="flex flex-col items-start justify-start w-full">
                  <DialogDescription className="w-full">
                    <div className="w-full flex pt-3 mb-1 flex-row justify-between items-center">
                      <span className="edit-node-modal-span text-text w-full">
                        Title
                      </span>
                      <AlertDialog.Trigger
                        className=" bg-background p-2 hover:bg-muted rounded-lg transition "
                      >
                        <DeleteIcon fill="var(--text)" />
                      </AlertDialog.Trigger>
                    </div>
                  </DialogDescription>
                  <InputComponent className="w-full" onChange={e => { setTitle(e) }} password={false} value={title} />
                  <Tabs.Content value={conditionEditableTypes.custom} className="w-full">
                    <div className="mt-4 w-full overflow-y-scroll max-h-[480px]">
                      <h5 className="text-foreground text-sm font-semibold mb-2">Conditions</h5>
                      <CodeMirror
                        value={code}
                        lang={pythonLanguage.name}
                        onChange={(e, viewUpdate) => {
                          setCode(e)
                          const linesState: string[] = viewUpdate.state.toJSON(stateFields).doc.split('\n')
                          console.log(linesState)
                          linesState.forEach((line, idx, lines) => {
                            if (line.includes('def')) {
                              let func: string = line
                              const func_description: string = line.split('def')[1].slice(0, -1).replace(' ', '')
                              const func_name: string = func_description.split('(')[0].replace(' ', '')
                              for (let i: number = idx + 1; i < lines.length; i++) {
                                if (lines[i] !== '' && lines[i] !== ' ' && lines[i][0] === ' ') {
                                  func = func.concat('\n')
                                  func = func.concat(lines[i])
                                } else {
                                  break;
                                }
                              }
                              const function_object: { name: string; description: string; func: string } = {
                                name: func_name,
                                description: func_description,
                                func: func
                              }
                              console.log(function_object)
                              let prev_functions: { name: string; description: string; func: string }[] = JSON.parse(localStorage.getItem('storage_functions')) ?? []
                              if (prev_functions.every((f) => {
                                if (f.name === function_object.name) {
                                  prev_functions = prev_functions.filter((fun) => fun.name !== f.name)
                                  return f.func !== function_object.func
                                } else {
                                  if (function_object.name.includes(f.name)) {
                                    prev_functions = prev_functions.filter((fun) => fun.name !== f.name)
                                    return true
                                  } 
                                  return true
                                }
                              })) {
                                localStorage.setItem('storage_functions', JSON.stringify([...prev_functions, function_object]))
                              }
                            }
                          })
                        }}
                        placeholder="Please enter your python condition"
                        className=" border border-border bg-muted rounded-lg w-full p-2 h-60 max-h-60 mb-2"
                        style={{
                          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                        }}
                        height="222px"
                        maxHeight="222px"
                        minHeight='192px'
                        theme={dark ? myThemeDark : myThemeLight}
                        extensions={[
                          python(),
                          autocompletion({}),
                          myLang
                        ]}
                      />
                      <CodeEditor
                        value={code}
                        language="python"
                        placeholder="Please enter your python condition"
                        onChange={(evn) => setCode(evn.target.value)}
                        padding={15}
                        data-color-mode={dark ? "dark" : "light"}
                        className=" border border-border bg-muted rounded-lg w-full h-32 max-h-32 overflow-y-scroll "
                        minHeight={192}
                        readOnly
                        style={{
                          // backgroundColor: "var(--muted)",
                          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                        }}
                      />
                    </div>
                  </Tabs.Content>
                  <Tabs.Content value={conditionEditableTypes.slot_filling} className="w-full">

                  </Tabs.Content>
                  <Tabs.Content value={conditionEditableTypes.using_llm} className="w-full">
                    <>
                      <span className="flex flex-row items-end mt-4 mb-4 justify-between">
                        <label className="flex flex-col w-full" htmlFor="">
                          <span className="text-text text-sm">Model name</span>
                          <Dropdown onSelect={e => setLLM_Model(e)} options={condition_llms} value={llm_model} />
                        </label>
                        <label className="flex flex-col w-full ml-2" htmlFor="">
                          <span className="text-text text-sm">API Key</span>
                          <InputComponent className="mt-1" onChange={e => setApi_key(e)} password={false} value={api_key} />
                        </label>
                      </span>
                      <label className="mb-4 block" htmlFor="">
                        <span className="text-text text-sm"> Prompt </span>
                        <textarea defaultValue={prompt} onChange={e => setPrompt(e.target.value)} name="prompt" id="condition_prompt" className="w-full rounded-lg mt-1 cond-textarea bg-background" rows={10}></textarea>
                      </label>
                      <label className="flex flex-col w-full" htmlFor="">
                        <span className="text-text text-sm font-semibold mb-1"> Condition satisfaction triggers </span>
                        <textarea placeholder="# if the following is true, the condition is satisfied" className="w-full h-[60px] overflow-y-scroll p-3 py-1 border-border border-[1px] rounded-md outline-[#8d96b5] outline-2 text-sm font-normal " />
                      </label>
                    </>
                  </Tabs.Content>
                </div>
              </div>
              <DialogFooter>
                <HelpBtn />
                <div className="flex flex-row gap-2">
                  <Button
                    className="mt-3"
                    onClick={handleClick}
                    type="submit"
                  >
                    Save Conditions
                  </Button>
                  {!promptTestWindow && custom && (
                    <Button
                      className="mt-3 bg-neutral-300 text-black hover:bg-neutral-400"
                      onClick={e => { setPromptTestWindow(true) }}
                    >
                      Test prompt
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
            {promptTestWindow && custom && (
              <>
                <span className="min-h-[572px] max-h-full ml-2.5 w-[1px] bg-border rounded-lg block"></span>
                <div className={` flex flex-col justify-between text-lg font-semibold min-w-[0px] max-w-[220px] test-anim-for-modal ml-3 `}>
                  <div className="w-full flex flex-col justify-between h-full">
                    <div>
                      <Title className="flex flex-row items-center gap-2 mb-3">
                        <PlayIcon fill="var(--text)" />
                        Prompt testing
                      </Title>
                      <div>
                        <Title className="font-semibold text-sm mb-3">
                          User input
                        </Title>
                        <textarea placeholder="Type something" className="w-full h-[70px] p-3 py-1 border-border border-[1px] rounded-md oborder outline-2 text-sm font-normal "></textarea>
                        <Button className=" flex flex-row gap-2 text-xs w-full h-7 mb-4 ">
                          <Play2Icon />
                          Run
                        </Button>
                      </div>
                    </div>
                    <div className="w-full mb-4">
                      <Title className="font-semibold text-sm">
                        Prompt keys
                      </Title>
                      <div className="text-neutral-400 flex flex-col text-sm font-normal">
                        <span>some.key_1</span>
                        <span>some.key_2</span>
                        <span>some.key_3</span>
                      </div>
                    </div>
                    <div className="w-full">
                      <Title className="font-semibold text-sm mb-3">
                        Response output
                      </Title>
                      <textarea placeholder="Test response will be displayed here." className="w-full h-[200px] p-3 border-border border-[1px] rounded-md outline-border outline-2 text-sm font-normal " name="" id="" rows={10}></textarea>
                      <Button className="bg-white text-black hover:bg-neutral-200 border-black border-[1px] h-7 ">
                        Test triggers
                      </Button>
                      <p className="text-xs mt-2.5 mb-2.5"> Condition status: <span className={` ${isSatisfied ? "text-green-500" : "text-red-500"} `}> {isSatisfied ? "Successfully satisfied" : "Not satisfied"} </span> </p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 ml-auto bg-neutral-300 text-black w-max hover:bg-neutral-400"
                    onClick={e => { setPromptTestWindow(false) }}
                  >
                    Stop testing
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        <AlertDelete onDelete={onDelete} />
      </AlertDialog.Root>
    </Tabs.Root>
  );
}
