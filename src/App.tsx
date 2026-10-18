import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import WeatherPage from './pages/WeatherPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/weather" element={<WeatherPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
