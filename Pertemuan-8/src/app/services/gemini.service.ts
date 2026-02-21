import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  // ================================================================
  // GANTI DENGAN API KEY GEMINI ANDA DARI aistudio.google.com
  // ================================================================
  private apiKey = 'AIzaSyCeUShh_fRN6WiFLng77lT19Z1eULB9SuU';

  // Model Gemini terbaru (2.5 Flash)
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor(private http: HttpClient) {}

  /**
   * Mengirim prompt ke Gemini AI dan mengembalikan Observable.
   * Digunakan oleh: Chat AI & Grammar Checker
   */
  generateText(prompt: string): Observable<any> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    return this.http.post<any>(url, body);
  }
}