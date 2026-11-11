import { Component, inject, OnDestroy, signal } from '@angular/core';
import { OcrService } from './ocr.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly errorMessage = signal('');

  ngOnDestroy(): void {
    const previewUrl = this.previewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }

  protected onFileSelected(event: Event): void {
    this.errorMessage.set('');
    this.recognizedText.set('');
    this.selectedFile.set(null);
    this.hasRecognized.set(false);
    this.copyMessage.set('');
    const previewUrl = this.previewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.previewUrl.set(null);
    }
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      const file = target.files?.[0];
      if (file) {
        const maxFileSize = 2000000;
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          if (file.size > maxFileSize) {
            this.errorMessage.set('File exceeds the 2 MB limit');
          } else {
            this.selectedFile.set(file);
            const objectUrl = URL.createObjectURL(file);
            this.previewUrl.set(objectUrl);
          }
        } else {
          this.errorMessage.set('Unsupported file format');
        }
      }
    }
  }

  protected clearSelection(input: HTMLInputElement): void {
    const previewUrl = this.previewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.previewUrl.set(null);
    }
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.recognizedText.set('');
    this.hasRecognized.set(false);
    this.copyMessage.set('');
    input.value = '';
  }

  private readonly ocrService = inject(OcrService);
  protected readonly recognizedText = signal('');
  protected readonly isLoading = signal(false);

  protected recognizeText(): void {
    const file = this.selectedFile();
    if (!file || this.isLoading()) return;

    this.errorMessage.set('');
    this.recognizedText.set('');
    this.isLoading.set(true);
    this.hasRecognized.set(false);
    this.copyMessage.set('');

    this.ocrService.recognize(file).subscribe({
      next: (result) => {
        this.recognizedText.set(result.text);
        this.isLoading.set(false);
        this.hasRecognized.set(true);
      },
      error: () => {
        this.errorMessage.set('Text recognition failed. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  protected readonly hasRecognized = signal(false);

  protected readonly copyMessage = signal('');

  protected async copyText(): Promise<void> {
    this.copyMessage.set('');
    const text = this.recognizedText();
    if (!text.trim() || this.isLoading()) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copyMessage.set('Text copied');
    } catch (error) {
      this.copyMessage.set('Could not copy text. Please select and copy it manually.');
    }
  }
}
