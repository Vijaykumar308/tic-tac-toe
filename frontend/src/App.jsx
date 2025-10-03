import './App.css'
import Board from './components/Board';
import { createBrowserRouter, RouterProvider, useLoaderData } from "react-router-dom";

// Create a wrapper component to handle the game ID
const GameRoute = () => {
  const { gameId } = useLoaderData();
  return <Board isPvP={true} gameId={gameId} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Board />
  },
  {
    path: "/game/:id",
    element: <GameRoute />,
    loader: ({ params }) => {
      return { gameId: params.id };
    }
  }
]);

function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  )
}

export default App;
