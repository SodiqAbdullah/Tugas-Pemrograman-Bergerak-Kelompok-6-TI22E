import { TestBed } from '@angular/core/testing';

import { DataMahasiswa } from './data-mahasiswa.service';

describe('DataMahasiswa', () => {
  let service: DataMahasiswa;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataMahasiswa);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
