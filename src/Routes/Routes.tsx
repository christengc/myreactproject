import { createBrowserRouter } from "react-router-dom"
import About from '../pages/About'
import Contact from '../pages/Contact'
import Cv from '../pages/Cv'
import Shapes from '../pages/ongoing/Shapes'
import MailRendering from '../pages/ongoing/mailRendering'
import Ongoing from '../pages/Ongoing'
import Projects from '../pages/Projects'
import App from '../App'

export const router = createBrowserRouter([
{  
    path: "/",
    element: <App />,
    children: [
        {path: "", element: <About />},
        {path: "contact", element: <Contact />},
        {path: "about", element: <About />},
        {path: "cv", element: <Cv />},
        {path: "ongoing", element: <Ongoing />},
        {path: "projects", element: <Projects />},
        {path: "ongoing/shapes", element: <Shapes />},
        {path: "ongoing/mail-rendering", element: <MailRendering />},
      ]
 } 
])