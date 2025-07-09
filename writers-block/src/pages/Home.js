import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_HOST}/login`;
  };

  const goToFiles = () => {
    navigate("/files");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Google Drive Files Viewer</h1>
      <button onClick={handleLogin}>Login with Google</button>
      <button onClick={goToFiles} style={{ marginLeft: 10 }}>
        List My Files
      </button>
    </div>
  );
}

