import DisclosureComponent from "../DisclosureComponent";
import {
  classNames,
  flow_colors,
  getCurrNode,
  nodeColors,
  nodeIconsLucide,
  nodeNames,
  titleNodeColors,
} from "../../../../utils";
import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { typesContext } from "../../../../contexts/typesContext";
import { APIClassType, APIObjectType } from "../../../../types/api";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import { Code2, FileDown, FileUp, Save, Search } from "lucide-react";
import { PopUpContext } from "../../../../contexts/popUpContext";
import ExportModal from "../../../../modals/exportModal";
import ApiModal from "../../../../modals/ApiModal";
import { TabsContext } from "../../../../contexts/tabsContext";
import { alertContext } from "../../../../contexts/alertContext";
import { Separator } from "../../../../components/ui/separator";
import { Menu } from "lucide-react";
import { FlowColorSVG } from "../../../../icons/FlowColorSVG";
import { CheckSVG } from "../../../../icons/CheckSVG";
import { Link, useNavigate } from "react-router-dom";
import { XIcon } from "../../../../icons/XIcon/XIcon";
import AddFlowModal from "../../../../modals/addFlowModal";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import { PlusIcon } from "../../../../icons/PlusIcon";
import { FileUpIcon } from "../../../../icons/FileUpIcon";
import { FileDownIcon } from "../../../../icons/FileDownIcon";
import { SaveIcon } from "../../../../icons/SaveIcon";
import { CodeIcon } from "../../../../icons/CodeIcon";
import { ManageIcon } from "../../../../icons/ManageIcon";
import EditFlowSettings from "../../../../components/EditFlowSettingsComponent";
import { darkContext } from "../../../../contexts/darkContext";
import { FlowType, NodeType } from "../../../../types/flow";
import { FilterNodesType } from "../../../../types/components";
import { MyStorageIcon } from "../../../../icons/MyStorageIcon";
import MyStorageModal from "../../../../modals/MyStorageModal";

export default function ExtraSidebar() {
  const { data } = useContext(typesContext);
  const { openPopUp, closePopUp } = useContext(PopUpContext);
  const { dark } = useContext(darkContext)
  const { flows, tabId, uploadFlow, tabsState, saveFlow, save, setTabId, addFlow, removeFlow, goToNodeHandler, setTargetNode, targetNode } =
    useContext(TabsContext);

  const { reactFlowInstance } = useContext(typesContext)

  // console.log(flows)

  const { setSuccessData, setErrorData } = useContext(alertContext);
  const [dataFilter, setFilterData] = useState(data);
  const [nodesFilter, setNodesFilter] = useState<FilterNodesType[]>()
  const [search, setSearch] = useState("");
  const [activeFlow, setActiveFlow] = useState(tabId)
  const isPending = tabsState[tabId]?.isPending;

  const navigate = useNavigate()

  function onDragStart(
    event: React.DragEvent<any>,
    data: { type: string; node?: APIClassType }
  ) {
    //start drag event
    var crt = event.currentTarget.cloneNode(true);
    crt.style.position = "absolute";
    crt.style.top = "-500px";
    crt.style.right = "-500px";
    crt.classList.add("cursor-grabbing");
    document.body.appendChild(crt);
    event.dataTransfer.setDragImage(crt, 0, 0);
    event.dataTransfer.setData("json", JSON.stringify(data));
  }

  // const goToNodeHandler = (currFlow: FlowType, nodeID: string) => {
  //   const currNode: NodeType = currFlow.data.nodes.find((node) => node.data.id == nodeID)
  //   setTimeout(() => {
  //     setTabId(flows.find((flow) => currFlow.name == flow.name).id)
  //     navigate(`/flow/${flows.find((flow) => currFlow.name == flow.name).id}`)
  //     setTimeout(() => {
  //       const nodes = reactFlowInstance.getNodes()
  //       let node = nodes.find((node) => node.id == currNode.id)
  //       reactFlowInstance.fitBounds({ x: currNode.position.x - node.width / 2, y: currNode.position.y - node.height / 2, width: node.width * 2, height: node.height * 2 })
  //       node.selected = true
  //     }, 50);
  //   }, 5);
  // }

  function handleSearchInput(e: string) {
    setFilterData((_) => {
      let ret = {};
      Object.keys(data).forEach((d: keyof APIObjectType, i) => {
        ret[d] = {};
        let keys = Object.keys(data[d]).filter((nd) =>
          nd.toLowerCase().includes(e.toLowerCase())
        );
        keys.forEach((element) => {
          ret[d][element] = data[d][element];
        });
      });
      return ret;
    });
  }

  const handleSearchInputActiveNodes = (e: string) => {
    // console.log(nodesFilter)
    const currFlows = flows.filter((flow) => flow.data.nodes.filter((node: NodeType) => node.data.node.display_name.toLowerCase().includes(e.toLowerCase())))
    const currNodes = currFlows.map((flow) => {
      const nodes = flow.data.nodes.filter((node: NodeType) => node.data.node.display_name.toLowerCase().includes(e.toLowerCase()))
      return { flow: flow, filteredNodes: nodes }
    })
    setNodesFilter(prev => currNodes)
    return currNodes
  }

  function handleAddFlow() {
    try {
      addFlow(null, true).then((id) => {
        navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    }
  }


  const Highlight = (props) => {
    const { filter, str } = props
    if (!filter) return str
    const regexp = new RegExp(filter, 'ig')
    const matchValue = str.match(regexp)
    if (matchValue) {
      return str.split(regexp).map((s, index, array) => {
        if (index < array.length - 1) {
          const c = matchValue.shift()
          return <>{s}<span key={s+`${index}`} className={'bg-yellow-400 rounded'}>{c}</span></>
        }
        return s
      })
    }
    return str
  }

  const light = useCallback((str) => {
    return <Highlight filter={search} str={str} />
  }, [search])

  useEffect(() => {
    dataFilter.presets = {
      ...dataFilter.presets,
      ...JSON.parse(localStorage.getItem('presets'))
    }
  }, [JSON.parse(localStorage.getItem('presets')), closePopUp])

  const [componentsHeight, setComponentsHeight] = useState(0)
  const [searchHeight, setSearchHeight] = useState(0)

  useEffect(() => {
    const buttons = document.querySelector('.side-bar-buttons-arrangement')?.clientHeight
    const flows = document.querySelector('.side-bar-flows-arrangement')?.clientHeight
    const search = document.querySelector('.side-bar-search-div-placement')?.clientHeight
    const clientHeight = document.querySelector('.side-bar-arrangement')?.clientHeight
    setComponentsHeight(clientHeight - buttons - search - flows - 155)
    // console.log(clientHeight - buttons - search - flows - 144)
  }, [])



  return (
    <div className="side-bar-arrangement">
      <div className="side-bar-buttons-arrangement">
        <ShadTooltip content="Import" side="top">
          <button
            className="extra-side-bar-buttons"
            onClick={() => {
              // openPopUp(<ImportModal />);
              uploadFlow();
            }}
          >
            <FileUpIcon fill={dark ? "white" : "black"} />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Export" side="top">
          <button
            className={classNames("extra-side-bar-buttons")}
            onClick={(event) => {
              openPopUp(<ExportModal />);
            }}
          >
            <FileDownIcon fill={dark ? "white" : "black"} />
          </button>
        </ShadTooltip>
        <ShadTooltip content="Code" side="top">
          <button
            className={classNames("extra-side-bar-buttons")}
            onClick={(event) => {
              openPopUp(<ApiModal flow={flows.find((f) => f.id === tabId)} />);
            }}
          >
            <CodeIcon fill={dark ? "white" : "black"} />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Save" side="top">
          <button
            className="extra-side-bar-buttons"
            onClick={(event) => {
              saveFlow(flows.find((f) => f.id === tabId));
              setSuccessData({ title: "Changes saved successfully" });
            }}
            disabled={!isPending}
          >
            <SaveIcon
              stroke={dark ? (!isPending ? '#777' : '#fff') : (!isPending ? '#777' : '#000')}
            ></SaveIcon>
          </button>
        </ShadTooltip>
      </div>

      <div className="side-bar-search-div-placement">
        <div className="search-icon ml-1 left-0">
          {/* ! replace hash color here */}
          <Search size={20} strokeWidth={1} className="text-primary" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search"
          className="input-search rounded-xl"
          onChange={(e) => {
            handleSearchInput(e.target.value);
            setSearch(e.target.value);
            handleSearchInputActiveNodes(e.target.value);
          }}
        />
      </div>

      <Separator />

      <div className="side-bar-flows-arrangement mt-2 mb-8">
        <div className="mb-2 ml-2 mr-2 flex flex-row items-center justify-between">
          <h5 className="extra-title">Flows</h5>
          <div className="flex flex-row items-center gap-0">
            <ShadTooltip content="Flow settings">
              <button
                onClick={e => openPopUp(<FlowSettingsModal />)}
                disabled={tabId == 'GLOBAL'}
                className={`flow-manage-button`}>
                <ManageIcon fill={dark ? (tabId == 'GLOBAL' ? '#ddd' : 'white') : (tabId == 'GLOBAL' ? '#ddd' : 'black')} />
              </button>
            </ShadTooltip>
            <ShadTooltip content="Add flow" >
              <button
                onClick={e => openPopUp(<AddFlowModal />)}
                className={`flow-manage-button`}>
                <PlusIcon fill={dark ? "white" : "black"} />
                {/* {active && <CheckSVG />} */}
              </button>
            </ShadTooltip>
          </div>
        </div>
        <div className="px-2">
          {flows.map((flow, i) => {
            const active = (flow.id == tabId)
            return (
              <div key={flow.id} className="relative h-max">
                <div className="block relative">
                  <Link
                    to={`/flow/${flow.id}`}
                    key={flow.id}
                    onClick={e => {
                      setTabId(flow.id);
                      setTimeout(() => {
                        reactFlowInstance.fitView({ maxZoom: 1 })
                      }, 75);
                    }}
                    className={`w-full ${flow.id == tabId && 'bg-muted'} ${flow.id != 'GLOBAL' ? 'pl-4' : 'pl-1'} py-1.5 px-3 flex flex-row items-center justify-between text-sm bg-background rounded-lg `}>
                    <div className={`flex flex-row items-center relative `}>
                      {flow.id !== "GLOBAL" && i !== flows.length - 1 && <span className="block absolute w-1 h-[1px] bg-neutral-300"></span>}
                      {i === flows.length - 1 && (
                        <svg className="-rotate-90 absolute -left-[1.5px] top-[7px] " xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                          <path d="M0.5 5C0.5 5.27614 0.723858 5.5 1 5.5C1.27614 5.5 1.5 5.27614 1.5 5H0.5ZM5 1.5H5.5V0.5H5V1.5ZM1.5 5V3H0.5V5H1.5ZM3 1.5H5V0.5H3V1.5ZM1.5 3C1.5 2.17157 2.17157 1.5 3 1.5V0.5C1.61929 0.5 0.5 1.61929 0.5 3H1.5Z" fill="#D4D4D4" />
                        </svg>
                      )}
                      <FlowColorSVG fill={flow.color} />
                      <span className="ml-3"> {flow.name} </span>
                    </div>
                    <div className="flex flex-row gap-2">
                      {active && <CheckSVG fill={dark ? "white" : "black"} />}
                    </div>
                  </Link>
                </div>
                {flow.id == "GLOBAL" && (
                  <span style={{ height: `${flows.length * 36 - 55}px`, zIndex: 99 }} className={`block absolute w-[1px] bg-neutral-300 z-10 left-[15px] rounded-lg `}> </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <Separator />
      <div className="flex flex-col justify-between gap-2 h-full pb-10">
        <div className="side-bar-components-div-arrangement" style={{
          maxHeight: componentsHeight
        }}>
          <h5 className="mb-2 mt-4 ml-2 extra-title"> Available components </h5>
          <div
            className="overflow-y-scroll scrollbar-hide">
            {Object.keys(dataFilter)
              .sort()
              .map((d: keyof APIObjectType, i) =>
                Object.keys(dataFilter[d]).length > 0 ? (
                  <DisclosureComponent
                    openDisc={search.length == 0 ? false : false}
                    key={nodeNames[d]}
                    button={{
                      title: nodeNames[d] ?? nodeNames.unknown,
                      Icon: nodeIconsLucide[d] ?? nodeIconsLucide.unknown,
                    }}
                  >
                    <div className="side-bar-components-gap">
                      {Object.keys(dataFilter[d])
                        .sort()
                        .map((t: string, k) => {
                          // console.log(d, t)
                          return (
                            <ShadTooltip
                              content={data[d][t]?.display_name ?? ""}
                              side="right"
                              key={data[d][t]?.display_name ?? "unknown"}
                            >
                              <div key={k} data-tooltip-id={t}>
                                <div
                                  draggable
                                  className={"side-bar-components-border"}
                                  style={{
                                    borderLeftColor:
                                      titleNodeColors[t] ?? (dataFilter[d][t].color ?? nodeColors.unknown),
                                  }}
                                  onDragStart={(event) => {
                                    onDragStart(event, {
                                      type: t,
                                      node: data[d][t],
                                    })
                                  }
                                  }
                                  onDragEnd={() => {
                                    document.body.removeChild(
                                      document.getElementsByClassName(
                                        "cursor-grabbing"
                                      )[0]
                                    );
                                  }}
                                >
                                  <div className="side-bar-components-div-form">
                                    <span className="side-bar-components-text">
                                      {data[d][t]?.display_name ?? ""}
                                    </span>
                                    <Menu className="side-bar-components-icon " />
                                  </div>
                                </div>
                              </div>
                            </ShadTooltip>
                          )
                        })}
                    </div>
                  </DisclosureComponent>
                ) : (
                  <div key={i}></div>
                )
              )}
          </div>
          {search ? (
            <div className="side-bar-components-gap pb-10">
              <h5 className=" mt-4 extra-title extra-title"> Results </h5>
              <div>
                {nodesFilter?.map((nf: FilterNodesType) => {
                  if (nf.filteredNodes?.length) {
                    return (
                      <div key={nf.flow.id} className="mt-2">
                        <div className="flex flex-row items-center justify-start gap-1.5">
                          {/* <span className={` w-4 h-4 block rounded-full `} style={{ backgroundColor: nf.flow.color ?? "grey", opacity: 0.7 }} >  </span> */}
                          <FlowColorSVG fill={nf.flow.color} />
                          <p className="font-semibold"> {nf.flow.name ?? ''} </p>
                        </div>
                        <div className="mt-1">
                          {nf.filteredNodes?.map((node) => {
                            return (
                              <div
                                key={node.id}
                                className={"side-bar-components-border mb-1 "}
                                style={{
                                  borderLeftColor:
                                    titleNodeColors[node.data.node.base_classes[0]] ?? nodeColors.unknown,
                                }}
                              >
                                <Link
                                  key={nf.flow.id}
                                  to={`/flow/${nf.flow.id}`}
                                  onClick={e => {
                                    setTabId(nf.flow.id)
                                    setTimeout(() => {
                                      setTargetNode(node)
                                    }, 25);
                                    // setTimeout(() => {
                                    //   // goToNodeHandler(nf.flow, node.id)
                                    // }, 50);
                                    // setTargetNode(getCurrNode(flows, nf.flow.id, node.id))
                                  }}
                                  className="flex flex-row items-center justify-between side-bar-components-div-form px-3 py-1.5 cursor-pointer border-solid ">
                                  <p> {light(node.data.node.display_name)} </p>
                                </Link>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          ) : <></>}

        </div>
        <div className="px-2">
          <button onClick={e => openPopUp(<MyStorageModal dataFilter={dataFilter} />)} className=" flex flex-row items-center justify-center gap-1 bg-muted w-full rounded-lg py-0.5 pr-1 font-medium ">
            <MyStorageIcon className="" fill={dark ? "white" : "black"} />
            My Storage
          </button>
        </div>
      </div>
    </div>
  );
}
