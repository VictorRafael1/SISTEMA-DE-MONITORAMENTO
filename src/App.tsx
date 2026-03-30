import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Equipment from './pages/Equipment';
import MapView from './pages/MapView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="escolas" element={<Schools />} />
          <Route path="equipamentos" element={<Equipment />} />
          <Route path="mapa" element={<MapView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
