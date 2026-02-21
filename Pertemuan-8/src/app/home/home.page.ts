import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom, Subject } from "rxjs";
import {
  debounceTime,
  switchMap,
  takeUntil,
  filter,
  tap,
} from "rxjs/operators";

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  IonLabel,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import {
  send,
  personAdd,
  mail,
  call,
  location,
  person,
  calendar,
} from "ionicons/icons";

import { GeminiService } from "../services/gemini.service";

// Interface untuk pesan chat
interface ChatMessage {
  role: "user" | "model";
  text: string;
}

// Interface untuk hasil grammar check
interface GrammarResult {
  status: "Correct" | "Incorrect";
  correction: string;
  explanation?: string;
}

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonList,
    IonLabel,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonTextarea,
    IonSegment,
    IonSegmentButton
],
})
export class HomePage implements OnInit, OnDestroy {
  // ============================================================
  // SHARED STATE
  // ============================================================
  activeTab: string = "chat"; // Tab yang sedang aktif
  private destroy$ = new Subject<void>(); // Untuk cleanup Observable saat komponen dihancurkan

  // Referensi ke elemen scroll chat
  @ViewChild("chatContainer") chatContainer!: ElementRef;

  // TAB 1: CHAT AI - Observable
  chatInput: string = "";
  chatHistory: ChatMessage[] = [];
  chatLoading: boolean = false;

  // TAB 2: RANDOM USER GENERATOR - Promise (async/await)
  randomUser: any = null;
  userLoading: boolean = false;

  // TAB 3: GRAMMAR CHECKER - Observable + RxJS
  grammarControl = new FormControl(""); // FormControl untuk textarea
  grammarResult: GrammarResult | null = null;
  grammarChecking: boolean = false;

  constructor(
    private geminiService: GeminiService,
    private http: HttpClient,
  ) {
    addIcons({ send, personAdd, mail, call, location, person, calendar });
  }

  ngOnInit() {
    this.setupGrammarChecker();
  }

  ngOnDestroy() {
    // Hentikan semua Observable saat komponen dihancurkan
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange() {
    // Reset grammar result saat pindah tab
    if (this.activeTab !== "grammar") {
      this.grammarResult = null;
    }
  }

  // ============================================================
  // TAB 1: LOGIC CHAT AI
  // Konsep: Observable (subscribe) - bawaan HttpClient Angular
  // ============================================================
  kirimPesanChat() {
    if (!this.chatInput.trim() || this.chatLoading) return;

    const pesanUser = this.chatInput.trim();

    // 1. Tampilkan pesan user di chat
    this.chatHistory.push({ role: "user", text: pesanUser });
    this.chatInput = "";
    this.chatLoading = true;

    // Scroll ke bawah
    setTimeout(() => this.scrollToBottom(), 100);

    // 2. Panggil GeminiService menggunakan Observable (subscribe)
    this.geminiService.generateText(pesanUser).subscribe({
      next: (response) => {
        // 3. Ambil teks jawaban dari struktur JSON Google Gemini
        const jawabanAI = response.candidates[0].content.parts[0].text;

        // 4. Tampilkan jawaban AI
        this.chatHistory.push({ role: "model", text: jawabanAI });
        this.chatLoading = false;

        // Scroll ke bawah setelah AI menjawab
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error("Error Chat AI:", err);
        this.chatHistory.push({
          role: "model",
          text: "⚠️ Maaf, AI sedang tidak bisa menjawab. Periksa API key atau koneksi internet.",
        });
        this.chatLoading = false;
      },
    });
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }

  // ============================================================
  // TAB 2: LOGIC RANDOM USER GENERATOR
  // Konsep: PROMISE - async/await dengan lastValueFrom()
  // lastValueFrom() mengkonversi Observable menjadi Promise
  // ============================================================
  async generateUser() {
    this.userLoading = true;
    this.randomUser = null;

    try {
      // HttpClient.get() mengembalikan Observable.
      // lastValueFrom() mengkonversinya menjadi Promise agar bisa digunakan async/await.
      const response: any = await lastValueFrom(
        this.http.get("https://randomuser.me/api/"),
      );

      // Ambil data user pertama dari array results
      this.randomUser = response.results[0];
    } catch (error) {
      console.error("Error Random User:", error);
      alert("Gagal mengambil data user. Periksa koneksi internet.");
    } finally {
      this.userLoading = false; // Selalu matikan loading, baik sukses maupun error
    }
  }

  // ============================================================
  // TAB 3: LOGIC LIVE GRAMMAR CHECKER
  // Konsep: Observable + RxJS Operators:
  //   - debounceTime(1000): Tunggu 1 detik setelah berhenti mengetik
  //   - switchMap: Batalkan request lama jika user mengetik lagi
  //   - filter: Abaikan input kosong
  // ============================================================
  private setupGrammarChecker() {
    this.grammarControl.valueChanges
      .pipe(
        // Abaikan jika input kosong atau kurang dari 5 karakter
        filter((text) => !!text && text.trim().length >= 5),

        // Tunggu 1 detik setelah user berhenti mengetik sebelum kirim ke AI
        // Ini menghemat API call yang tidak perlu
        debounceTime(1000),

        // Tampilkan loading saat mulai proses
        tap(() => {
          this.grammarChecking = true;
          this.grammarResult = null;
        }),

        // switchMap: Batalkan Observable sebelumnya jika ada input baru.
        // Jika user mengetik "A" lalu cepat mengetik "AB", request untuk "A" dibatalkan.
        switchMap((text) => {
          const prompt = `You are a grammar checker. Check the grammar of this English sentence: "${text}"
        
        Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation outside JSON.
        Format: {"status": "Correct" or "Incorrect", "correction": "corrected sentence or empty string", "explanation": "brief explanation in Indonesian"}`;

          return this.geminiService.generateText(prompt);
        }),

        // Hentikan Observable saat komponen dihancurkan (mencegah memory leak)
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response) => {
          try {
            // Ambil teks dari respons Gemini
            let rawText = response.candidates[0].content.parts[0].text;

            // Bersihkan kemungkinan markdown code block dari AI
            rawText = rawText
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();

            // Parse JSON hasil grammar check
            this.grammarResult = JSON.parse(rawText);
          } catch (e) {
            // Jika AI tidak mengembalikan JSON valid, tampilkan error
            this.grammarResult = {
              status: "Incorrect",
              correction: "Tidak dapat menganalisis. Coba ketik ulang.",
              explanation: "Terjadi kesalahan parsing respons AI.",
            };
          }
          this.grammarChecking = false;
        },
        error: (err) => {
          console.error("Error Grammar Checker:", err);
          this.grammarResult = {
            status: "Incorrect",
            correction: "Error koneksi ke AI.",
            explanation: "Periksa API key atau koneksi internet Anda.",
          };
          this.grammarChecking = false;
        },
      });
  }
}
