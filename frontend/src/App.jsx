import "./index.css";
import { useState, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { Card } from "./Card";

const INITIAL_CARDS = [null, null, null];

export default function App() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("success");
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case "connected":
        setConnected(true);
        break;
      case "card":
        setCards((prev) => {
          const updated = [...prev];
          updated[data.data.index] = { state: "ready", data: data.data };
          return updated;
        });
        break;
      case "error":
        if (data.index >= 0) {
          setCards((prev) => {
            const updated = [...prev];
            updated[data.index] = { state: "error", message: data.message, onRetry: () => {} };
            return updated;
          });
        }
        break;
      case "done":
        setIsGenerating(false);
        setIsDone(true);
        break;
    }
  }, []);

  const { sendMessage } = useWebSocket(handleMessage);

  const cardsWithRetry = cards.map((card) => {
    if (card && card.state === "error") {
      return { ...card, onRetry: () => handleRetry() };
    }
    return card;
  });

  function handleGenerate() {
    if (!topic.trim() || isGenerating) return;
    setCards([{ state: "loading" }, null, null]);
    setIsDone(false);
    setIsGenerating(true);
    setCurrentTopic(topic.trim());
    setTimeout(() => {
      setCards((prev) => { const u = [...prev]; if (!u[1]) u[1] = { state: "loading" }; return u; });
    }, 900);
    setTimeout(() => {
      setCards((prev) => { const u = [...prev]; if (!u[2]) u[2] = { state: "loading" }; return u; });
    }, 1800);
    sendMessage({ type: "generate", topic: topic.trim(), mode });
  }

  function handleRetry() {
    if (!currentTopic) return;
    setCards((prev) => { const u = [...prev]; u[2] = { state: "loading" }; return u; });
    setIsDone(false);
    setIsGenerating(true);
    sendMessage({ type: "retry", topic: currentTopic, mode: "success" });
  }

  const visibleCards = cardsWithRetry.filter(Boolean);
  const hasError = cards.some((c) => c && c.state === "error");

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">AI</span>
            <span className="logo-text">Learning Cards</span>
          </div>
          <div className={`connection-dot ${connected ? "online" : "offline"}`}>
            {connected ? "Connected" : "Connecting..."}
          </div>
        </div>
      </header>
      <main className="main">
        <div className="hero">
          <h1 className="hero-title">Generate Learning Cards</h1>
          <p className="hero-sub">Enter any topic and get 3 structured learning cards instantly</p>
        </div>
        <div className="input-section">
          <div className="input-row">
            <input
              className="topic-input"
              type="text"
              placeholder="e.g. Photosynthesis, Newton's Laws..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              disabled={isGenerating}
            />
            <button className={`generate-btn ${isGenerating ? "loading" : ""}`} onClick={handleGenerate} disabled={isGenerating || !topic.trim()}>
              {isGenerating ? <span className="btn-loading"><span className="spinner" /> Generating...</span> : "Generate"}
            </button>
          </div>
          <div className="mode-toggle">
            <span className="mode-label">Test mode:</span>
            <div className="toggle-group">
              <button className={`toggle-btn ${mode === "success" ? "active success" : ""}`} onClick={() => setMode("success")} disabled={isGenerating}>Success</button>
              <button className={`toggle-btn ${mode === "failure" ? "active failure" : ""}`} onClick={() => setMode("failure")} disabled={isGenerating}>Failure</button>
            </div>
            <span className="mode-hint">{mode === "failure" ? "Card 3 will fail intentionally" : "All 3 cards will stream successfully"}</span>
          </div>
        </div>
        {visibleCards.length > 0 && (
          <div className="cards-section">
            <div className="cards-grid">
              {cardsWithRetry.map((card, i) => card ? <Card key={i} card={card} index={i} /> : null)}
            </div>
            {isDone && !hasError && <div className="done-banner">All 3 cards generated successfully!</div>}
            {isDone && hasError && <div className="error-banner">Generation stopped. Click Retry on Card 3 to continue.</div>}
          </div>
        )}
      </main>
    </div>
  );
}