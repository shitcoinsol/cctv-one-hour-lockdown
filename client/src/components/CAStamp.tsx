import { useState } from 'react';

export function CAStamp() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText('TBD');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-30">
      {copied && (
        <div className="absolute -top-8 left-0 font-mono text-xs text-green-400">
          Copied!
        </div>
      )}
      <button
        onClick={handleClick}
        className="font-mono text-xs text-platinum/60 focus-ring cursor-pointer"
        aria-label="Copy TBD to clipboard"
        data-testid="button-ca-stamp"
      >
        CA: TBD
      </button>
    </div>
  );
}
