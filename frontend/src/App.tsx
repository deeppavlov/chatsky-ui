import { NextUIProvider } from "@nextui-org/react"
import { ReactFlowProvider } from "@xyflow/react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { Preloader } from "./UI/Preloader/Preloader"
import ContextWrapper from "./contexts"
import { UndoRedoProvider } from "./contexts/undoRedoContext"
import Fallback from "./pages/Fallback"
import Flow from "./pages/Flow"
import Home from "./pages/Home"
import Index from "./pages/Index"

const App = () => {
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ContextWrapper>
          <Index />
        </ContextWrapper>
      ),
      loader: Preloader,
      errorElement: <Fallback />,
      children: [
        {
          path: "app/flow/:flowId",
          element: (
            <ReactFlowProvider>
              <UndoRedoProvider>
                <Flow />
              </UndoRedoProvider>
            </ReactFlowProvider>
          ),
          loader: Preloader,
        },
        { path: "app/home", element: <Home />, loader: Preloader },
      ],
    },
  ])

  return (
    <NextUIProvider>
      <RouterProvider router={router} />
    </NextUIProvider>
  )
}

export default App
