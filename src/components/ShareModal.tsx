import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizProgress: any[];
  dateStr: string;
  onShare: (message: string) => void;
  generateMessage: (progress: any[], date: string) => string;
  maxAttempts?: number; // Added this to make it flexible
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, onClose, quizProgress, dateStr, onShare, generateMessage, maxAttempts = 3 
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullMessage = generateMessage(quizProgress, dateStr);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // Helper to render the blocks for a single question
  const renderBlocks = (p: any) => {
    const blocks = [];
    for (let i = 1; i <= maxAttempts; i++) {
      let colorClass = "empty";
      
      if (p?.status === 'solved') {
        if (i < p.attempts) colorClass = "orange"; // Previous failed tries
        else if (i === p.attempts) colorClass = "green"; // The successful try
      } else if (p?.status === 'failed') {
        colorClass = "red"; // All tries used and failed
      }
      
      blocks.push(<span key={i} className={`block ${colorClass}`}></span>);
    }
    return blocks;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>✕</button>
        
        <h3>Daily Results</h3>
        <p className="modal-date">
          {dateStr}
        </p>
        
        {/* Visual Preview */}
        <div className="results-grid-preview">
          {quizProgress.map((p, i) => (
            <div key={i} className="grid-row" style={{ marginBottom: '6px' }}>
              {renderBlocks(p)}
            </div>
          ))}
        </div>

        <div className="share-actions">
          <button className="whatsapp-send-btn" onClick={() => onShare(fullMessage)}>
            Share to WhatsApp
          </button>
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? "Copied! ✅" : "Copy link for Share 📋"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;