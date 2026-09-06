import { useCallback, useRef, useState } from 'react';
import { Icon } from './Icon';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
}

export function FileDropzone({ onFile, accept = '.xlsx,.xls,.csv' }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setFileName(file.name);
      onFile(file);
    },
    [onFile],
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-border bg-surface-muted hover:border-primary-300'
        }`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <Icon name="upload_file" size={32} className="text-primary-500" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            {fileName ? fileName : 'Drag and drop the beneficiary file here'}
          </p>
          <p className="mt-1 text-sm text-ink-muted">or click to browse from your computer — .xlsx, .xls or .csv</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
