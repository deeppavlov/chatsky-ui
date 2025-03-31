import { NextUIProvider } from '@nextui-org/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ContextWrapper from './contexts'
import PopUpProvider from './contexts/popUpContext'
import Fallback from './pages/Fallback'
import Home from './pages/Home'
import Index from './pages/Index'
import TabsWrapper from './pages/TabsWrapper'
import { Preloader } from './UI/Preloader/Preloader'

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ContextWrapper>
          <Index />
        </ContextWrapper>
      ),
      loader: Preloader,
      errorElement: <Fallback />,
      children: [
        {
          path: 'app/flow/:flowId',
          element: <TabsWrapper />,
          loader: Preloader,
        },
        {
          path: 'app/home',
          element: (
            <PopUpProvider>
              <Home />
            </PopUpProvider>
          ),
          loader: Preloader,
        },
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
