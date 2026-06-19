import React from "react";

// Card states: "loading" | "ready" | "error"
export function Card({ card, index }) {
  const labels = ["Card 1 — Introduction", "Card 2 — Core Mechanics", "Card 3 — Real World Impact"];

  if (card.state === "loading") {
    return (
      <div className="card card-loading">
        <div className="card-number">{labels[index]}</div>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-fact" />
        <div className="loading-label">Generating...</div>
      </div>
    );
  }

  if (card.state === "error") {
    return (
      <div className="card card-error">
        <div className="card-number">{labels[index]}</div>
        <div className="error-icon">!</div>
        <p className="error-message">{card.message}</p>
        <button className="retry-btn" onClick={card.onRetry}>
          Retry Card 3
        </button>
      </div>
    );
  }

  return (
    <div className="card card-ready">
      <div className="card-number">{labels[index]}</div>
      <h2 className="card-title">{card.data.title}</h2>
      <div className="card-section">
        <span className="section-label">Key Concept</span>
        <p className="card-concept">{card.data.concept}</p>
      </div>
      <div className="card-section fact-section">
        <span className="section-label">Fun Fact</span>
        <p className="card-fact">{card.data.funFact}</p>
      </div>
    </div>
  );
}
