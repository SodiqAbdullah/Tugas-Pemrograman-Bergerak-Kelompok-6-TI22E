import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton]
})
export class DetailPage implements OnInit {
  idMahasiswa: string | null = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Menangkap parameter 'id' dari URL
    this.idMahasiswa = this.route.snapshot.paramMap.get('id');
  }

}
