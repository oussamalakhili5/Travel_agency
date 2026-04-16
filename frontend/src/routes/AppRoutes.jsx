import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Hotels from '../pages/Hotels'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Register from '../pages/Register'
import Transports from '../pages/Transports'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/transports" element={<Transports />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
