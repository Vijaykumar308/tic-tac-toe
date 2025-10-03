import './App.css'
import Board from './components/Board';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Square from './components/Square';

const router = createBrowserRouter([
  {
    path:"/",
    element:<Board />
  },
  {
    path:"/game/:id",
    element:<Square />
  }

]);
function App() {
  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App
