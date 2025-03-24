// utils/stripMarkdown.js
export const stripMarkdown = (text) => {
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");
  return text;
};
