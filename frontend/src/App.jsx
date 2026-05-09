import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Documents from './pages/Documents'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App