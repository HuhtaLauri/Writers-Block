import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DocFile from "../components/DocFile";

export default function FileList() {
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/docs`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setFiles(data.files);
        } else {
          alert("Failed to fetch files. Are you logged in?");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching files.");
      }
    };

    fetchFiles();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Files</h2>
      <ul>
        {files &&
          files.map((file) => (
            DocFile(file={file}) 
          ))}
      </ul>
    </div>
  );
}

