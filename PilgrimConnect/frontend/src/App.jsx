import { BrowserRouter, Routes, Route } from "react-router-dom";
import PilgrimPage from "./Pages/PilgrimPage";
import Home from "./Pages/Home";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />

        {/* Explicit route */}
        <Route path="/pilgrims" element={<PilgrimPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
