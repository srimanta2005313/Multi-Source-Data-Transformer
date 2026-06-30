import { useEffect } from 'react';

interface ShortcutHandlers {
  onRunPipeline: () => void;
  onSaveConfig: () => void;
  onLoadSample: () => void;
}

export function useKeyboardShortcuts({
  onRunPipeline,
  onSaveConfig,
  onLoadSample,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      const key = e.key.toLowerCase();

      if (key === 'r') {
        e.preventDefault();
        onRunPipeline();
      } else if (key === 's') {
        e.preventDefault();
        onSaveConfig();
      } else if (key === 'l') {
        e.preventDefault();
        onLoadSample();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRunPipeline, onSaveConfig, onLoadSample]);
}
