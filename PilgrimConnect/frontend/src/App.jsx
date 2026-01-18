import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Pages
import Home from "./Pages/Home";
import PilgrimPage from "./Pages/PilgrimPage";
import BookDarshan from "./Pages/BookDarshan"; // <--- IMPORT THIS
import MyBookings from "./Pages/MyBookings";   // Recommended to add this if file exists

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Existing Pilgrim Page */}
        <Route path="/pilgrims" element={<PilgrimPage />} />

        {/* FIX: Add the Book Darshan Route */}
        <Route path="/BookDarshan" element={<BookDarshan />} />

        {/* Optional: Add My Bookings if you have it */}
        <Route path="/MyBookings" element={<MyBookings />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;