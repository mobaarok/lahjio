import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Words from "./pages/Words";
import Flashcards from "./pages/Flashcards";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/words" element={<Words />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}