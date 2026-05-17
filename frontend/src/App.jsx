import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Documents from './pages/Documents'
import ClientPortal from './pages/ClientPortal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/documents" element={<Documents />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App