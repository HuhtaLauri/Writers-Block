import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function FileViewer() {
  const { fileId } = useParams();
  const [content, setContent] = useState("");

  const [wordcount, setWordcount] = useState(0);
  const [wordcountTarget, setWordcountTarget] = useState(0)

  const fetchContent = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/docs/${fileId}/content`, {
      credentials: "include",
    });
  
    if (res.ok) {
      const text = await res.text();
      setContent(text);
      setWordcount(text.trim().split(' ').length)
    } else {
      alert("Failed to fetch file content");
  }
  };


  useEffect(() => {
    fetchContent();

    const interval = setInterval(() => {
      fetchContent();
    }, 10000)

  }, [fileId]);

  function WordcountButton() {

    async function handleClick() {
      fetchContent();
    }

    return (
    <button onClick={handleClick}>
        Päivitä sanamäärä
    </button>
    )
  }

  function WordcountTargetForm() {
    const [inputValue, setInputValue] = useState(0)

    const handleSubmit = (e) => {
        e.preventDefault();
        setWordcountTarget(inputValue) 
    }

    return (
    <form onSubmit={handleSubmit}>
      <label>
        Aseta tavoite sanamäärä: 
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
        />
      </label>
      <button type="submit" style={{ marginLeft: 10 }}>
        Päivitä tavoite
      </button>
    </form>
  );
  }

  function ProgressBar({ wordcount, wordcountTarget }) {
    const percent = (Number(wordcount) / Number(wordcountTarget)) * 100;
    return (
      <div style={{
        background: '#8c8d91',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '20px',
        width: '100%',
      }}>
        <div style={{
          width: `${percent}%`,
          backgroundColor: '#16f057',
          height: '100%',
          transition: 'width 0.3s ease',
        }} />
      </div>
    );
}


  function StatsBlock() {
    return (
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={cardStyle}>
          <h2>Sanamäärä</h2>
          <p>{wordcount}</p>
        </div>
        <div style={cardStyle}>
          <h2>Tavoite</h2>
          <p>{wordcountTarget}</p>
        </div>
      </div>
    );
  }

  function RefreshBlock() {
    return (
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={cardStyle}>
          <h2>Päivitä</h2>
          <WordcountButton />
        </div>
        <div style={cardStyle}>
          <h2>Tavoite</h2>
          <WordcountTargetForm />
        </div>
      </div>
    );
  }

  const cardStyle = {
    flex: 1,
    padding: '1rem',
    background: '#f3f4f6',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>Writer's block</h2>
      <RefreshBlock />
      <StatsBlock />
      <ProgressBar wordcount={wordcount} wordcountTarget={wordcountTarget}/>
    </div>
  );
}

