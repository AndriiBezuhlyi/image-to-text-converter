import {Injectable, inject} from '@angular/core'
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'

export interface OcrResponse {
  text: string
}
@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient)
  recognize(file: File): Observable<OcrResponse> {
    return this.http.post<OcrResponse>('/api/ocr', file, {headers: {'Content-Type': file.type}})
  }
}

