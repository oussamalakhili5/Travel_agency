import AdminDashboard from '../pages/AdminDashboard'
import AdminHotels from '../pages/AdminHotels'
import AdminReservations from '../pages/AdminReservations'
import AdminTransports from '../pages/AdminTransports'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Hotels from '../pages/Hotels'
import HotelDetail from '../pages/HotelDetail'
import Login from '../pages/Login'
import MyReservations from '../pages/MyReservations'
import MyPayments from '../pages/MyPayments'
import NotFound from '../pages/NotFound'
import PackageDetail from '../pages/PackageDetail'
import Packages from '../pages/Packages'
import PaymentPage from '../pages/PaymentPage'
import Profile from '../pages/Profile'
import Register from '../pages/Register'
import TransportDetail from '../pages/TransportDetail'
import Transports from '../pages/Transports'
import VerifyEmail from '../pages/VerifyEmail'
import AdminRoute from './AdminRoute'
import PrivateRoute from './PrivateRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetail />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/packages/:id" element={<PackageDetail />} />
      <Route path="/transports" element={<Transports />} />
      <Route path="/transports/:id" element={<TransportDetail />} />
      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/payments" element={<MyPayments />} />
        <Route path="/payments/reservations/:reservationId" element={<PaymentPage />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/hotels" element={<AdminHotels />} />
        <Route path="/admin/transports" element={<AdminTransports />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
