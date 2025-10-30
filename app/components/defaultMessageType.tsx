const DefaultMessageType = ({ text = "", sender }: { text?: string; sender: string }) => {
  // Helper function to decode HTML entities
  const decodeHtmlEntities = (str: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  };

  // Format text for better display
  const formatText = (content: string) => {
    if (!content) return "";
    
    // First, decode any HTML entities (in case the content was double-encoded)
    let decoded = content;
    if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&quot;')) {
      decoded = decodeHtmlEntities(content);
    }
    
    // Fix malformed image tags that start with -https:// or just https:// without <img src=
    // Pattern: -https://...png" alt="..." or https://...png" alt="..."
    decoded = decoded.replace(
      /-?(https?:\/\/[^\s"]+\.(png|jpg|jpeg|gif|webp|svg)[^"]*)" alt="([^"]+)"[^>]*>/gi,
      '<img src="$1" alt="$3" class="max-w-full h-auto rounded-lg my-2 shadow-md" style="max-height: 300px; object-fit: contain;" onerror="this.style.display=\'none\'" />'
    );
    
    // If content already contains properly formatted HTML img tags, return as is
    if (decoded.includes('<img src=') && !decoded.includes('&lt;img')) {
      return decoded;
    }
    
    // Replace markdown-style formatting
    let formatted = decoded
      // Images: ![alt](url) - MUST come before links
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2 shadow-md" style="max-height: 300px; object-fit: contain;" onerror="this.style.display=\'none\'" />')
      
      // Bold text: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/__(.+?)__/g, '<strong class="font-bold text-white">$1</strong>')
      
      // Italic text: *text* or _text_
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
      
      // Code blocks: ```code```
      .replace(/```([\s\S]+?)```/g, '<pre class="bg-black/50 p-3 rounded-lg my-2 overflow-x-auto"><code class="text-sm text-green-400">$1</code></pre>')
      
      // Inline code: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-sm text-blue-300">$1</code>')
      
      // Links: [text](url) or plain URLs
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline break-all">$1</a>')
      
      // Headers: ## Header or ### Header
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-3 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
      
      // Bullet lists: - item or * item
      .replace(/^[•\-\*] (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
      
      // Numbered lists: 1. item
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      
      // Blockquotes: > text
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-zinc-600 pl-4 my-2 italic text-zinc-400">$1</blockquote>')
      
      // Emojis and special markers
      .replace(/✅/g, '<span class="text-green-400">✅</span>')
      .replace(/❌/g, '<span class="text-red-400">❌</span>')
      .replace(/⚠️/g, '<span class="text-yellow-400">⚠️</span>')
      .replace(/🔥/g, '<span class="text-orange-400">🔥</span>')
      .replace(/💰/g, '<span class="text-yellow-300">💰</span>')
      .replace(/🚀/g, '<span class="text-blue-400">🚀</span>')
      .replace(/⏳/g, '<span class="text-gray-400">⏳</span>')
      .replace(/🔄/g, '<span class="text-blue-300">🔄</span>')
      
      // Line breaks: \n\n becomes paragraph break
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    
    // Wrap consecutive list items in ul/ol
    formatted = formatted.replace(/(<li class="ml-4 mb-1">• .+?<\/li>(\s*<br\/>)*)+/g, (match) => {
      return '<ul class="my-2">' + match.replace(/<br\/>/g, '') + '</ul>';
    });
    
    formatted = formatted.replace(/(<li class="ml-4 mb-1 list-decimal">.+?<\/li>(\s*<br\/>)*)+/g, (match) => {
      return '<ol class="my-2 list-decimal ml-6">' + match.replace(/<br\/>/g, '') + '</ol>';
    });
    
    return formatted;
  };

  return (
    <div
      className={`p-4 rounded-xl max-w-[75%] shadow-lg ${
        sender === "user" 
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white self-end" 
          : "bg-zinc-800 text-zinc-100 self-start border border-zinc-700"
      }`}
      style={{
        wordBreak: "break-word",
        maxWidth: "85%",
        overflowWrap: "anywhere",
        lineHeight: "1.6",
      }}
    >
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatText(text) }}
      />
    </div>
  );
};

export default DefaultMessageType;


