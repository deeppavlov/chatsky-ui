import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { NextUIProvider } from "@nextui-org/react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { Preloader } from "./UI/Preloader/Preloader.tsx"
import Flow from "./pages/Flow.tsx"
import ContextWrapper from "./contexts/index.tsx"
import Home from "./pages/Home.tsx"
import { ReactFlowProvider } from "reactflow"
import { UndoRedoProvider } from "./contexts/undoRedoContext.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ContextWrapper>
        <App />
      </ContextWrapper>
    ),
    loader: Preloader,
    errorElement: <div>404</div>,
    children: [
      {
        path: "/flow/:flowId",
        element: (
          <ReactFlowProvider>
            <UndoRedoProvider>
              <Flow />
            </UndoRedoProvider>
          </ReactFlowProvider>
        ),
        loader: Preloader,
      },
      {
        path: "/home",
        element: <Home />,
        loader: Preloader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <NextUIProvider>
    <RouterProvider router={router} />
  </NextUIProvider>
)
