import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import './index.css';

export default function App() {
  return (
    <div className="page">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
