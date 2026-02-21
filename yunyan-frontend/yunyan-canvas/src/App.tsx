import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { Loader2 } from "lucide-react";
import "./App.css";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home"));
const AboutPage = lazy(() => import("./pages/About"));
const TemplatePage = lazy(() => import("./pages/Template"));
const EditorPage = lazy(() => import("./pages/Editor"));
const ERDiagramPage = lazy(() => import("./pages/ERDiagram"));
const DiagramFeaturePage = lazy(() => import("./pages/DiagramFeature"));

function App() {
  return (
    <Router>
      <Navbar />
      <Suspense 
        fallback={
          <div className="h-screen w-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/er-diagram" element={<ERDiagramPage />} />
          <Route path="/diagram/:type" element={<DiagramFeaturePage />} />
        </Routes>
      </Suspense>
      <Footer />
      <ScrollToTop />
    </Router>
  );
}

export default App;
