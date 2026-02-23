import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TambahMhsPage } from './tambah-mhs.page';

describe('TambahMhsPage', () => {
  let component: TambahMhsPage;
  let fixture: ComponentFixture<TambahMhsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TambahMhsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
