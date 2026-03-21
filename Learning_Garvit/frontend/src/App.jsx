import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Navbar from './components/Navbar';
import './index.css';
import 'react-quill-new/dist/quill.snow.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doc/:id" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
