import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Schedule from '@/pages/Schedule'
import Booking from '@/pages/Booking'
import Manage from '@/pages/Manage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/manage" element={<Manage />} />
        </Route>
      </Routes>
    </Router>
  )
}
