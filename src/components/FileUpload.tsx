import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  extractedText?: string;
}

interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  onTextExtracted?: (text: string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export default function FileUpload({ 
  onFilesChange, 
  onTextExtracted,
  accept = "image/*,.pdf,.doc,.docx,.txt", 
  multiple = true,
  maxFiles = 5 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Имитация OCR - в реальном проекте здесь был бы API для распознавания текста
        setTimeout(() => {
          const mockText = `Распознанный текст из ${file.name}:\n\nПример задачи:\nНайти производную функции f(x) = x² + 3x - 5\n\nРешение:\nf'(x) = 2x + 3`;
          resolve(mockText);
        }, 1000);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const extractTextFromDocument = async (file: File): Promise<string> => {
    // Имитация извлечения текста из документов
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockText = `Содержимое документа ${file.name}:\n\nТема: Дифференциальные уравнения\nЗадание: Решить уравнение dy/dx = 2xy\nУсловие: y(0) = 1`;
        resolve(mockText);
      }, 800);
    });
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const url = URL.createObjectURL(file);
    let extractedText = '';

    if (file.type.startsWith('image/')) {
      extractedText = await extractTextFromImage(file);
    } else if (file.type.includes('pdf') || file.type.includes('doc') || file.type.includes('text')) {
      extractedText = await extractTextFromDocument(file);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      extractedText
    };
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];
      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    setIsProcessing(false);

    onFilesChange?.(updatedFiles);
    
    // Объединяем весь извлеченный текст
    const allExtractedText = updatedFiles
      .map(f => f.extractedText)
      .filter(Boolean)
      .join('\n\n---\n\n');
    
    if (allExtractedText) {
      onTextExtracted?.(allExtractedText);
    }
  }, [files, maxFiles, onFilesChange, onTextExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    
    const allExtractedText = updatedFiles
      .map(f => f.extractedText)
      .filter(Boolean)
      .join('\n\n---\n\n');
    
    onTextExtracted?.(allExtractedText);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.includes('pdf')) return 'FileText';
    if (type.includes('doc')) return 'FileText';
    return 'File';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium mb-2">
                Перетащите файлы сюда или нажмите для выбора
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Поддерживаются: изображения, PDF, DOC, DOCX, TXT
              </p>
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="FolderOpen" size={16} className="mr-2" />
                  Выбрать файлы
                </label>
              </Button>
            </div>
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Загружено: {files.length}/{maxFiles}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Loader2" size={16} className="animate-spin text-primary" />
              <span className="text-sm">Обрабатываем файлы и распознаём текст...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Загруженные файлы:</h4>
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={getFileIcon(file.type) as any} size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                        {file.extractedText && (
                          <Badge variant="outline" className="text-xs">
                            <Icon name="Eye" size={12} className="mr-1" />
                            Текст распознан
                          </Badge>
                        )}
                      </div>
                      {file.extractedText && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Показать распознанный текст
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {file.extractedText}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}