import {routes} from "./routes"
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const accessToken = useSelector((state: RootState) => state.user.accessToken)
  const isAuthenticated = !!accessToken;

  return (
    <>
    <ToastContainer/>
    <Router>
      <Routes>
        {routes.public.map(({path, element})=>(
          <Route key={path} path={path} element={element}/>
        ))}

        {routes.private.map(({path, element}) => (
          <Route key={path} path={path} element={isAuthenticated ? element : <Navigate to= "/login" replace/>}/>
        ))}

         {routes.admin.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element} 
            >
              {route.children.map((child, idx) => (
                <Route
                  key={idx}
                  index={child.index}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          ))}
        {/* Add more routes for other templates here */}
      </Routes>
    </Router>
    </>
  );
};

export default App
