import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <WhatsAppButton />
      <Chatbot />
    </>
  );
}

export default App;