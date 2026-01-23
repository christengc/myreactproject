import { Provider } from "@/components/ui/provider"
import { StrictMode } from 'react'
import { createRoot} from 'react-dom/client'
import { RouterProvider } from "react-router-dom"
import { router } from "./Routes/Routes.tsx"
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
