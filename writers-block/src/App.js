import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FileList from "./pages/FileList";
import FileViewer from "./pages/FileViewer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/files" element={<FileList />} />
        <Route path="/file/:fileId" element={<FileViewer />} />
      </Routes>
    </Router>
  );
}

export default App;

