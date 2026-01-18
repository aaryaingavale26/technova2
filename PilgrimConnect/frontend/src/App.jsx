import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Pages
import Home from "./Pages/Home";
import PilgrimPage from "./Pages/PilgrimPage";
import BookDarshan from "./Pages/BookDarshan";
import MyBookings from "./Pages/MyBookings";
import Login from "./Pages/Login";       // <--- Import Login
import Register from "./Pages/Register"; // <--- Import Register

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pilgrims" element={<PilgrimPage />} />
        <Route path="/BookDarshan" element={<BookDarshan />} />
        <Route path="/MyBookings" element={<MyBookings />} />
        
        {/* ADD THESE ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;