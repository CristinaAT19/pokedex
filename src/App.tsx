import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import DetailPage from './pages/DetailPage.tsx'
import ListPage from './pages/ListPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListPage />} />
        <Route path="pokemon/:name" element={<DetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
