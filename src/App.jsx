import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import Chatbot from "./components/Chatbot";
import { Toaster } from "react-hot-toast";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <WhatsAppButton />
      <Chatbot />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;