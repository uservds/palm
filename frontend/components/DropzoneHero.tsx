'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneHeroProps {
  onFileSelected: (url: string) => void;
}

export default function DropzoneHero({ onFileSelected }: DropzoneHeroProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelected(url);
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-16">
      <Card
        className={cn(
          'relative flex h-72 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-accent-soft'
            : preview
              ? 'border-primary bg-accent-soft'
              : 'border-content-border bg-surface hover:border-primary/50'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {preview ? (
          <>
            <img
              src={preview}
              alt="Ваша ладонь"
              className="h-28 w-28 rounded-full object-cover"
            />
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Check className="h-4 w-4" /> Фото загружено
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-badge">
              <Upload className="h-7 w-7 text-content-muted" />
            </div>
            <p className="text-base font-medium text-content-main">
              Загрузите фото ладони
            </p>
            <p className="text-sm text-content-muted">
              Нажмите или перетащите фото сюда
            </p>
          </>
        )}
      </Card>
    </div>
  );
}