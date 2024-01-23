import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { conditionEditableTypes, condition_llms } from "../../utils";
import { typesContext } from "../../contexts/typesContext";
import InputComponent from "../../components/inputComponent";
import Dropdown from "../../components/dropdownComponent";
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
import { DeleteIcon } from "../../icons/DeleteIcon";
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { TabsContext } from "../../contexts/tabsContext";
import { HelpBtn } from "../../components/ui/helpbtn";
import { LLM_cnd_icon } from "../../icons/LLMConditionIcon";
import { Custom_cnd_icon } from "../../icons/CustomConditionIcon";
import { Title } from "@radix-ui/react-dialog";
import { PlayIcon } from "../../icons/PlayIcon";
import { Play2Icon } from "../../icons/Play2Icon";
import * as Tabs from "@radix-ui/react-tabs";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import AlertDelete from "../deleteModal";
import { TypeOfConditionEditableType } from "../../types/components";
import CodeEditor from "@uiw/react-textarea-code-editor";
import CodeMirror, { TransactionSpec } from "@uiw/react-codemirror";
import { darkContext } from "../../contexts/darkContext";
import { SlotFillingConditionIcon } from "../../icons/SlotFillingConditionIcon";
import { python, pythonLanguage } from "@codemirror/lang-python";
import { CompletionContext, autocompletion } from "@codemirror/autocomplete";
import AddButton from "../../components/ui/AddButton";
import {
  firstLinePlugin,
  lineWidgetPlugin,
  myThemeDark,
  myThemeLight,
} from "./editorOptions";
import { createPortal } from "react-dom";

type StoredFunction = { name: string; description: string; body: string };

export default function EditConditionModal({
  data,
  conditionID,
}: {
  data: NodeDataType;
  conditionID: number;
}) {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { dark } = useContext(darkContext);
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext);
  const [custom, setCustom] = useState(true);
  const [conditionEditableType, setConditionEditableType] =
    useState<TypeOfConditionEditableType>(conditionEditableTypes.custom);

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }
  useEffect(() => {}, [closePopUp, data.node.template]);

  let conditions = data.node.conditions.length ? data.node.conditions : null;
  const condition =
    data.node?.conditions.find((cond) => conditionID === cond.conditionID) ??
    null;

  const [title, setTitle] = useState(condition?.name ? condition.name : "");
  // const [intent, setIntent] = useState(condition?.intent ? condition.intent : '')
  // const [action, setAction] = useState(condition?.action ? condition.action : '')
  // const [variables, setVariables] = useState(condition?.variables ? condition.variables : '')
  const [llm_model, setLLM_Model] = useState(
    condition?.llm_model ? condition.llm_model : ""
  );
  const [api_key, setApi_key] = useState(
    condition?.APIKey ? condition.APIKey : ""
  );
  const [prompt, setPrompt] = useState(
    condition?.prompt ? condition.prompt : ""
  );

  const firstString = `def ${title}(ctx: Context, pipeline: Pipeline) -> bool:`;
  const [code, setCode] = useState<string>(
    condition?.action ??
      `${firstString}\n# enter your python condition:\n  \n  return True # or false`
  );
  // const [functions, setFunctions] = useState<StoredFunction[]>([]);
  const [storedFunctions, setStoredFunctions] = useState<StoredFunction[]>(
    JSON.parse(localStorage.getItem("storage_functions")) ?? []
  );

  const [promptTestWindow, setPromptTestWindow] = useState(false);
  const [isSatisfied, setIsSatisfied] = useState(false);
  const [conditionsState, setConditionsState] = useState(conditions);

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (conditionEditableType === conditionEditableTypes.custom) {
      condition.prompt = "";
      condition.APIKey = "";
      condition.llm_model = "";
      condition.name = title;
      condition.action = code;
      // condition.intent = intent
      // condition.variables = variables
    } else if (conditionEditableType === conditionEditableTypes.using_llm) {
      condition.prompt = prompt;
      condition.APIKey = api_key;
      condition.llm_model = llm_model;
      condition.name = title;
      condition.intent = "";
      condition.action = "";
      condition.variables = "";
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
    closePopUp();
    data.node.conditions = data.node.conditions.filter(
      (conditionF) => conditionF.conditionID != condition.conditionID
    );
    setConditionsState(
      data.node.conditions.filter(
        (conditionF) => conditionF.conditionID != condition.conditionID
      )
    );
  };

  function myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/\w*/);
    if (word.from == word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: [
        ...storedFunctions.map(({ name, body }) => {
          return {
            label: name,
            type: "variable",
            apply: name,
            info: body,
          };
        }),
        {
          label: "dff",
          type: "variable",
          apply: "dff_function(name)",
          detail: "dff_function",
          info: "dff_function(name:string)",
        },
      ],
    };
  }

  const [myLang, setMyLang] = useState(
    pythonLanguage.data.of({
      autocomplete: myCompletions,
    })
  );

  // const findFunctions = (text: string): StoredFunction[] => {
  //   const linesState: string[] = text.split("\n");
  //   const funcs: StoredFunction[] = linesState
  //     .map((line, idx, lines) => {
  //       if (!line.includes("def")) {
  //         return null;
  //       }

  //       let func: string = line;
  //       const func_description: string = line
  //         .split("def")[1]
  //         .slice(0, -1)
  //         .replace(" ", "");
  //       const func_name: string = func_description
  //         .split("(")[0]
  //         .replace(" ", "");
  //       for (let i: number = idx + 1; i < lines.length; i++) {
  //         if (lines[i] !== "" && lines[i] !== " " && lines[i][0] === " ") {
  //           func = func.concat("\n");
  //           func = func.concat(lines[i]);
  //         } else {
  //           break;
  //         }
  //       }

  //       return {
  //         name: func_name,
  //         description: func_description,
  //         body: func,
  //       };
  //     })
  //     .filter((f) => Boolean(f));
  //   return funcs;
  // };

  // const saveFunctionsToStorage = ({
  //   name,
  //   description,
  //   body,
  // }: StoredFunction) => {
  //   const prevFunctions =
  //     JSON.parse(localStorage.getItem("storage_functions")) || [];

  //   const functionObject = {
  //     name,
  //     description,
  //     body,
  //   };
  //   const index = prevFunctions.findIndex((el) => el.name === name);
  //   if (index >= 0) {
  //     prevFunctions[index] = functionObject;
  //     localStorage.setItem("storage_functions", JSON.stringify(prevFunctions));
  //     setStoredFunctions(prevFunctions);
  //   } else {
  //     localStorage.setItem(
  //       "storage_functions",
  //       JSON.stringify([...prevFunctions, functionObject])
  //     );
  //     setStoredFunctions([...prevFunctions, functionObject]);
  //   }
  // };

  return (
    <Tabs.Root defaultValue={conditionEditableTypes.custom}>
      <AlertDialog.Root>
        <Dialog open={true} onOpenChange={setModalOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent
            className={`sm:max-w-[600px] ${
              promptTestWindow ? "lg:max-w-[960px]" : "lg:max-w-[700px]"
            } flex flex-row transition-all duration-500 `}
          >
            <div className="flex w-full flex-col justify-between">
              <div className=" flex w-full flex-col items-start justify-start ">
                <DialogHeader className="flex flex-row items-start justify-start gap-6">
                  <DialogTitle>
                    <span className="mb-2 flex flex-row items-center">
                      <EditConditionIcon fill="var(--text)" />
                      <p className="ml-1">Edit Conditions</p>
                    </span>
                    <Badge variant="secondary">
                      {" "}
                      {data.id} | {condition.name ? condition.name : "noname"}{" "}
                    </Badge>
                  </DialogTitle>
                  <Tabs.List className="storage-modal-tab-list">
                    <Tabs.Trigger
                      onClick={(e) =>
                        setConditionEditableType(conditionEditableTypes.custom)
                      }
                      className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active w-36 "
                      value={conditionEditableTypes.custom}
                    >
                      {/* <ComponentsIcon /> */}
                      <Custom_cnd_icon />
                      Custom
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      onClick={(e) =>
                        setConditionEditableType(
                          conditionEditableTypes.slot_filling
                        )
                      }
                      className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active w-36 "
                      value={conditionEditableTypes.slot_filling}
                    >
                      {/* <Custom_cnd_icon opacity="0.7" /> */}
                      <SlotFillingConditionIcon />
                      Slot filling
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      onClick={(e) =>
                        setConditionEditableType(
                          conditionEditableTypes.using_llm
                        )
                      }
                      className="storage-modal-tab-trigger data-[state=active]:storage-modal-tab-trigger-active w-36 "
                      value={conditionEditableTypes.using_llm}
                    >
                      {/* <MyStoragePresetsIcon /> */}
                      <LLM_cnd_icon />
                      Using LLM
                    </Tabs.Trigger>
                  </Tabs.List>
                </DialogHeader>
                <div className="flex w-full flex-col items-start justify-start">
                  <DialogDescription className="w-full">
                    <div className="mb-1 flex w-full flex-row items-center justify-between pt-3">
                      <span className="edit-node-modal-span w-full text-text">
                        Title
                      </span>
                      <AlertDialog.Trigger className=" rounded-lg bg-background p-2 transition hover:bg-muted ">
                        <DeleteIcon fill="var(--text)" />
                      </AlertDialog.Trigger>
                    </div>
                  </DialogDescription>
                  <InputComponent
                    className="w-full"
                    onChange={(e) => {
                      setTitle(e);
                      setCode((prev) => {
                        const [_functionName, ...rest] = prev.split("(");
                        return `def ${e}(${rest.join("(")}`;
                      });
                    }}
                    password={false}
                    value={title}
                  />
                  <Tabs.Content
                    value={conditionEditableTypes.custom}
                    className="w-full"
                  >
                    <div className="mt-4 max-h-[480px] w-full">
                      <h5 className="mb-2 text-sm font-semibold text-foreground">
                        Conditions
                      </h5>
                      <CodeMirror
                        value={code}
                        lang={pythonLanguage.name}
                        onChange={(e: string) => {
                          setCode(
                            `${firstString}\n${e
                              .split("\n")
                              .slice(1)
                              .join("\n")}`
                          );
                          // setFunctions(findFunctions(e));
                        }}
                        // onCreateEditor={(viewUpdate) => {
                        //   setFunctions(
                        //     findFunctions(viewUpdate.state.doc.toString())
                        //   );
                        // }}
                        className="relative mb-2 h-60 max-h-60 w-full rounded-lg border border-border bg-muted p-2"
                        style={{
                          fontFamily:
                            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                        }}
                        height="222px"
                        maxHeight="222px"
                        minHeight="192px"
                        theme={dark ? myThemeDark : myThemeLight}
                        extensions={[
                          python(),
                          autocompletion({}),
                          myLang,
                          // lineWidgetPlugin,
                          firstLinePlugin,
                        ]}
                      />
                      {/* {functions.map((func, i) => {
                        const parent =
                          document.querySelectorAll(".line-widget")[i];

                        return (
                          parent &&
                          createPortal(
                            <AddButton
                              key={func.name}
                              className="align-sub"
                              tooltipText="Add to storage"
                              onClick={() => saveFunctionsToStorage(func)}
                              isAdded={
                                storedFunctions.findIndex(
                                  ({ name, body }) =>
                                    body === func.body && name === func.name
                                ) >= 0
                              }
                            />,
                            parent
                          )
                        );
                      })} */}
                      <CodeEditor
                        value={code}
                        language="python"
                        placeholder="Please enter your python condition"
                        onChange={(evn) => setCode(evn.target.value)}
                        padding={15}
                        data-color-mode={dark ? "dark" : "light"}
                        className=" h-32 max-h-32 w-full overflow-y-scroll rounded-lg border border-border bg-muted "
                        minHeight={192}
                        readOnly
                        style={{
                          // backgroundColor: "var(--muted)",
                          fontFamily:
                            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                        }}
                      />
                    </div>
                  </Tabs.Content>
                  <Tabs.Content
                    value={conditionEditableTypes.slot_filling}
                    className="w-full"
                  ></Tabs.Content>
                  <Tabs.Content
                    value={conditionEditableTypes.using_llm}
                    className="w-full"
                  >
                    <>
                      <span className="mb-4 mt-4 flex flex-row items-end justify-between">
                        <label className="flex w-full flex-col" htmlFor="">
                          <span className="text-sm text-text">Model name</span>
                          <Dropdown
                            onSelect={(e) => setLLM_Model(e)}
                            options={condition_llms}
                            value={llm_model}
                          />
                        </label>
                        <label className="ml-2 flex w-full flex-col" htmlFor="">
                          <span className="text-sm text-text">API Key</span>
                          <InputComponent
                            className="mt-1"
                            onChange={(e) => setApi_key(e)}
                            password={false}
                            value={api_key}
                          />
                        </label>
                      </span>
                      <label className="mb-4 block" htmlFor="">
                        <span className="text-sm text-text"> Prompt </span>
                        <textarea
                          defaultValue={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          name="prompt"
                          id="condition_prompt"
                          className="cond-textarea mt-1 w-full rounded-lg bg-background"
                          rows={10}
                        ></textarea>
                      </label>
                      <label className="flex w-full flex-col" htmlFor="">
                        <span className="mb-1 text-sm font-semibold text-text">
                          {" "}
                          Condition satisfaction triggers{" "}
                        </span>
                        <textarea
                          placeholder="# if the following is true, the condition is satisfied"
                          className="h-[60px] w-full overflow-y-scroll rounded-md border-[1px] border-border p-3 py-1 text-sm font-normal outline-2 outline-[#8d96b5] "
                        />
                      </label>
                    </>
                  </Tabs.Content>
                </div>
              </div>
              <DialogFooter>
                <HelpBtn />
                <div className="flex flex-row gap-2">
                  <Button className="mt-3" onClick={handleClick} type="submit">
                    Save Conditions
                  </Button>
                  {!promptTestWindow && custom && (
                    <Button
                      className="mt-3 bg-neutral-300 text-black hover:bg-neutral-400"
                      onClick={(e) => {
                        setPromptTestWindow(true);
                      }}
                    >
                      Test prompt
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
            {promptTestWindow && custom && (
              <>
                <span className="ml-2.5 block max-h-full min-h-[572px] w-[1px] rounded-lg bg-border"></span>
                <div
                  className={` test-anim-for-modal ml-3 flex min-w-[0px] max-w-[220px] flex-col justify-between text-lg font-semibold `}
                >
                  <div className="flex h-full w-full flex-col justify-between">
                    <div>
                      <Title className="mb-3 flex flex-row items-center gap-2">
                        <PlayIcon fill="var(--text)" />
                        Prompt testing
                      </Title>
                      <div>
                        <Title className="mb-3 text-sm font-semibold">
                          User input
                        </Title>
                        <textarea
                          placeholder="Type something"
                          className="oborder h-[70px] w-full rounded-md border-[1px] border-border p-3 py-1 text-sm font-normal outline-2 "
                        ></textarea>
                        <Button className=" mb-4 flex h-7 w-full flex-row gap-2 text-xs ">
                          <Play2Icon />
                          Run
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4 w-full">
                      <Title className="text-sm font-semibold">
                        Prompt keys
                      </Title>
                      <div className="flex flex-col text-sm font-normal text-neutral-400">
                        <span>some.key_1</span>
                        <span>some.key_2</span>
                        <span>some.key_3</span>
                      </div>
                    </div>
                    <div className="w-full">
                      <Title className="mb-3 text-sm font-semibold">
                        Response output
                      </Title>
                      <textarea
                        placeholder="Test response will be displayed here."
                        className="h-[200px] w-full rounded-md border-[1px] border-border p-3 text-sm font-normal outline-2 outline-border "
                        name=""
                        id=""
                        rows={10}
                      ></textarea>
                      <Button className="h-7 border-[1px] border-black bg-white text-black hover:bg-neutral-200 ">
                        Test triggers
                      </Button>
                      <p className="mb-2.5 mt-2.5 text-xs">
                        {" "}
                        Condition status:{" "}
                        <span
                          className={` ${
                            isSatisfied ? "text-green-500" : "text-red-500"
                          } `}
                        >
                          {" "}
                          {isSatisfied
                            ? "Successfully satisfied"
                            : "Not satisfied"}{" "}
                        </span>{" "}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="ml-auto mt-3 w-max bg-neutral-300 text-black hover:bg-neutral-400"
                    onClick={(e) => {
                      setPromptTestWindow(false);
                    }}
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
