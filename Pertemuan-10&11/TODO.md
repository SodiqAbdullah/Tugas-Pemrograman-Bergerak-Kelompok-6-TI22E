# Testing Checklist for Delete and Edit Functionality

## ✅ Service Methods
- [x] hapusData(id) method in DataMahasiswaService
- [x] editData(id, data) method in DataMahasiswaService

## ✅ Home Page UI
- [x] Delete button (trash icon) on each list item
- [x] Edit button (pencil icon) on each list item
- [x] AlertController and Router properly injected

## ✅ Home Page Methods
- [x] hapusData() method with confirmation dialog
- [x] editData() method with navigation state

## ✅ Tambah-Mhs Page (Edit Mode)
- [x] ngOnInit checks for navigation state
- [x] Form pre-populated with existing data
- [x] simpanData() handles both add and edit modes
- [x] Title changes to "Edit Mahasiswa"
- [x] Button text changes to "Update Data"

## 🧪 Manual Testing Required
- [ ] Add new student data
- [ ] Click edit button - should navigate to edit form
- [ ] Modify data and save - should update existing record
- [ ] Click delete button - should show confirmation
- [ ] Confirm delete - should remove record
- [ ] Data persistence after page refresh
