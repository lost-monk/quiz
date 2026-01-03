export const useShareResults = () => {
  const generateShareMessage = (quizProgress: any[], dateStr: string) => {
    // High-compatibility emojis
    const GREEN = '🟩';
    const ORANGE = '🟧';
    const RED = '🟥'; // Changed from Blue to standard Red
    const WHITE = '⬜';
    const TARGET = '🎯';
    const shareUrl = window.location.href;

    // Calculate score
    const solvedCount = quizProgress.filter(p => p?.status === 'solved').length;

    let grid = "";
    quizProgress.forEach((p) => {
      if (p) {
        if (p.status === 'solved') {
          if (p.attempts === 1) grid += `${GREEN}${WHITE}${WHITE}\n`;
          else if (p.attempts === 2) grid += `${ORANGE}${GREEN}${WHITE}\n`;
          else grid += `${ORANGE}${ORANGE}${GREEN}\n`;
        } else {
          grid += `${RED}${RED}${RED}\n`;
        }
      } else {
        grid += `${WHITE}${WHITE}${WHITE}\n`;
      }
    });

    return `${TARGET} Daily Quiz - ${dateStr}\nScore: ${solvedCount}/6\n\n${grid.trim()}\n\nPlay here: ${shareUrl}`;
  };

  const shareToWhatsApp = (message: string) => {
    // api.whatsapp.com is often more stable for browser-to-web handoffs
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return { generateShareMessage, shareToWhatsApp };
};