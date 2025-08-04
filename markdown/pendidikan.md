## 📚 Pendidikan - Dosen

### ✅ Create Pendidikan

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/pendidikan`  
**Authorization:** Bearer `<token>`  
**Content-Type:** `multipart/form-data`  
**Role:** DOSEN

**Form-Data:**
- `file`: File bukti pendidikan (wajib, format `.pdf`)
- `data`: JSON string berisi data pendidikan. Contoh:
```json
{
  "kategori": "FORMAL",
  "jenjang": "S2",
  "prodi": "Teknik Informatika",
  "fakultas": "FT",
  "perguruanTinggi": "ITB",
  "lulusTahun": 2020
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 2,
    "dosenId": 5,
    "kategori": "FORMAL",
    "nilaiPak": 150,
    "filePath": "pendidikan/1923b786-6184-47fc-9175-aca44ab50b15.pdf",
    "statusValidasi": "PENDING",
    "reviewerId": null,
    "catatan": null,
    "createdAt": "2025-08-04T03:20:23.053Z",
    "updatedAt": "2025-08-04T03:20:23.053Z"
  }
}
```

---

### ✏️ Update Pendidikan

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/pendidikan/:id`  
**Authorization:** Bearer `<token>`  
**Content-Type:** `multipart/form-data`  
**Role:** DOSEN  
**Path Param:** `:id` → ID dari data pendidikan yang akan diubah

**Form-Data:**
- `file`: Opsional, file PDF pengganti jika ingin mengganti dokumen.
- `data`: JSON string berisi data yang diperbarui. Contoh:
```json
{
  "kategori": "FORMAL",
  "jenjang": "S3",
  "prodi": "Ilmu Komputer",
  "fakultas": "Fakultas Ilmu Komputer",
  "perguruanTinggi": "UI",
  "lulusTahun": 2024
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pendidikan berhasil diperbarui"
}
```

## 🧾 Pendidikan - Diklat (Pelatihan)

### ✅ Create Diklat

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/pendidikan`  
**Authorization:** Bearer `<token>`  
**Content-Type:** `multipart/form-data`  
**Role:** DOSEN

**Form-Data:**
- `file`: Wajib, file bukti sertifikat dalam format `.pdf`
- `data`: JSON string data diklat. Contoh:
```json
{
  "kategori": "DIKLAT",
  "namaDiklat": "Pelatihan AI & Data Science",
  "jenisDiklat": "Teknis",
  "penyelenggara": "Kemdikbud",
  "peran": "Peserta",
  "tingkatan": "Nasional",
  "jumlahJam": 40,
  "noSertifikat": "DIK-2025-00123",
  "tglSertifikat": "2025-07-01",
  "tempat": "Jakarta",
  "tglMulai": "2025-06-25",
  "tglSelesai": "2025-06-30"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 3,
    "dosenId": 5,
    "kategori": "DIKLAT",
    "nilaiPak": 3,
    "filePath": "pendidikan/76caf7e5-da8b-4280-b4f0-a0fda9c6c938.pdf",
    "statusValidasi": "PENDING",
    "reviewerId": null,
    "catatan": null,
    "createdAt": "2025-08-04T03:29:16.273Z",
    "updatedAt": "2025-08-04T03:29:16.273Z"
  }
}
```

> 📌 **Catatan:** Nilai PAK akan dihitung otomatis berdasarkan `jumlahJam` dan ketentuan sistem.

## ✏️ Update Diklat

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/pendidikan/3`  
> 📌 `3` adalah `id` dari data pendidikan diklat yang akan diperbarui.  
**Authorization:** Bearer `<token>`  
**Content-Type:** `multipart/form-data`  
**Role:** DOSEN (pemilik data)

---

### 📝 Form-Data
- `file`: *Opsional*, file PDF baru (maks 5MB)
- `data`: *Wajib*, JSON string isi data diklat. Contoh:
```json
{
  "kategori": "DIKLAT",
  "namaDiklat": "Pelatihan AI & Data Science",
  "jenisDiklat": "Teknis",
  "penyelenggara": "Kemdikbud",
  "peran": "Peserta",
  "tingkatan": "Nasional",
  "jumlahJam": 24,
  "noSertifikat": "DIK-2025-00223",
  "tglSertifikat": "2025-07-01",
  "tempat": "Jakarta",
  "tglMulai": "2025-06-26",
  "tglSelesai": "2025-06-30"
}
```

---

### ✅ Response (Berhasil)
```json
{
  "success": true,
  "message": "Pendidikan berhasil diperbarui"
}
```

---

> ℹ️ **Catatan:**  
> - Jika `file` tidak dikirim, file lama tetap digunakan.  
> - Setelah update, status validasi otomatis berubah menjadi `PENDING` dan menunggu review ulang oleh validator/admin.

## 📘 Create Pendidikan oleh Admin

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/pendidikan/admin/5`  
> 📌 `5` adalah `id` dari dosen yang datanya ingin ditambahkan.  
**Authorization:** Bearer `<admin_token>`  
**Content-Type:** `multipart/form-data`  
**Role:** ADMIN

---

### 📝 Form-Data
- `file`: *Wajib*, file PDF (maks 5MB)
- `data`: *Wajib*, JSON string isi data pendidikan, contoh untuk kategori `DIKLAT`:
```json
{
  "kategori": "DIKLAT",
  "namaDiklat": "Pelatihan AI & Data Science",
  "jenisDiklat": "Teknis",
  "penyelenggara": "Kemdikbud",
  "peran": "Peserta",
  "tingkatan": "Nasional",
  "jumlahJam": 40,
  "noSertifikat": "DIK-2025-00123",
  "tglSertifikat": "2025-07-01",
  "tempat": "Jakarta",
  "tglMulai": "2025-06-25",
  "tglSelesai": "2025-06-30"
}
```

---

### ✅ Response (Berhasil)
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 4,
    "dosenId": 5,
    "kategori": "DIKLAT",
    "nilaiPak": 3,
    "filePath": "pendidikan/05379445-0d59-4349-ae39-7b46a01c9a40.pdf",
    "statusValidasi": "PENDING",
    "reviewerId": null,
    "catatan": null,
    "createdAt": "2025-08-04T03:41:15.838Z",
    "updatedAt": "2025-08-04T03:41:15.838Z"
  }
}
```

---

## ✏️ Update Pendidikan oleh Admin

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/pendidikan/admin/5/4`  
> 📌 `5` adalah `id` dosen, `4` adalah `id` data pendidikan yang ingin diupdate.  
**Authorization:** Bearer `<admin_token>`  
**Content-Type:** `multipart/form-data`  
**Role:** ADMIN

---

### 📝 Form-Data
- `file`: *Opsional*, file PDF baru
- `data`: *Wajib*, JSON string isi data pendidikan:
```json
{
  "kategori": "DIKLAT",
  "namaDiklat": "Pelatihan Mikrotik",
  "jenisDiklat": "Teknis",
  "penyelenggara": "Pemerintah Kabupaten Ponorogo",
  "peran": "Peserta",
  "tingkatan": "Regional",
  "jumlahJam": 18,
  "noSertifikat": "DIK-2025-00123",
  "tglSertifikat": "2025-07-01",
  "tempat": "Ponorogo",
  "tglMulai": "2025-06-25",
  "tglSelesai": "2025-06-30"
}
```

---

### ✅ Response (Berhasil)
```json
{
  "success": true,
  "message": "Pendidikan berhasil diperbarui"
}
```

---

> ℹ️ **Catatan:**
> - File PDF wajib pada saat `create`, dan opsional saat `update`.  
> - Setiap perubahan akan mengatur status validasi kembali ke `PENDING`.  
> - Khusus admin, Anda dapat mengelola pendidikan atas nama dosen mana pun.

## ✅ Validasi Pendidikan

**Method:** `PATCH`  
**URL Template:**  
```
http://127.0.0.1:3000/pendidikan/:id/validasi
```

**Authorization:** Bearer `<token>`  
**Role:** VALIDATOR atau ADMIN

---

### 📥 Request Body (JSON)
```json
{
  "statusValidasi": "APPROVED",
  "catatan": "Data sudah sesuai"
}
```

Atau jika status **REJECTED**:
```json
{
  "statusValidasi": "REJECTED",
  "catatan": "File bukti salah"
}
```

> ⚠️ `catatan` **wajib** diisi jika `statusValidasi` adalah `"REJECTED"`

---

### 📌 Contoh URL
Validasi data pendidikan dengan ID `4`:
```
PATCH http://127.0.0.1:3000/pendidikan/4/validasi
```

---

### ✅ Response (APPROVED)
```json
{
  "id": 4,
  "dosenId": 5,
  "kategori": "DIKLAT",
  "nilaiPak": 3,
  "filePath": "pendidikan/05379445-0d59-4349-ae39-7b46a01c9a40.pdf",
  "statusValidasi": "APPROVED",
  "reviewerId": 5,
  "catatan": "Data sudah sesuai",
  "createdAt": "2025-08-04T03:41:15.838Z",
  "updatedAt": "2025-08-04T03:51:58.366Z"
}
```

---

### 🚫 Response (REJECTED)
```json
{
  "id": 3,
  "dosenId": 5,
  "kategori": "DIKLAT",
  "nilaiPak": 3,
  "filePath": "pendidikan/76caf7e5-da8b-4280-b4f0-a0fda9c6c938.pdf",
  "statusValidasi": "REJECTED",
  "reviewerId": 5,
  "catatan": "File bukti salah",
  "createdAt": "2025-08-04T03:29:16.273Z",
  "updatedAt": "2025-08-04T03:52:55.974Z"
}
```

---

> ℹ️ **Catatan:**
> - Validasi hanya dapat dilakukan oleh pengguna dengan peran `VALIDATOR` atau `ADMIN`.
> - Field `reviewerId` akan otomatis terisi dari user yang mengirim validasi.
> - Validasi `REJECTED` tanpa `catatan` akan menghasilkan error validasi (400 Bad Request).

## 🔍 Get Pendidikan by ID

**Method:** `GET`  
**URL Template:**
```
http://127.0.0.1:3000/pendidikan/:id
```

**Authorization:** Bearer `<token>`  
**Role:** Dosen terkait, Validator, atau Admin

---

### 📌 Contoh URL
Get data pendidikan dengan ID `4`:
```
GET http://127.0.0.1:3000/pendidikan/4
```

---

### ✅ Response
```json
{
  "success": true,
  "data": {
    "id": 4,
    "dosenId": 5,
    "kategori": "DIKLAT",
    "nilaiPak": 3,
    "filePath": "pendidikan/05379445-0d59-4349-ae39-7b46a01c9a40.pdf",
    "statusValidasi": "APPROVED",
    "reviewerId": 5,
    "catatan": "Data sudah sesuai",
    "createdAt": "2025-08-04T03:41:15.838Z",
    "updatedAt": "2025-08-04T03:51:58.366Z",
    "Formal": null,
    "Diklat": {
      "id": 2,
      "pendidikanId": 4,
      "jenisDiklat": "Teknis",
      "namaDiklat": "Pelatihan Mikrotik",
      "penyelenggara": "Pemerintah Kabupaten Ponorogo",
      "peran": "Peserta",
      "tingkatan": "Regional",
      "jumlahJam": 18,
      "noSertifikat": "DIK-2025-00123",
      "tglSertifikat": "2025-07-01T00:00:00.000Z",
      "tempat": "Ponorogo",
      "tglMulai": "2025-06-25T00:00:00.000Z",
      "tglSelesai": "2025-06-30T00:00:00.000Z"
    },
    "dosen": {
      "id": 5,
      "nama": "Dosen Baru"
    }
  }
}
```

---

### ℹ️ Catatan:
- Field `Formal` akan berisi data jika `kategori` adalah `"FORMAL"`, dan `Diklat` akan berisi data jika `kategori` adalah `"DIKLAT"`.
- Tipe data tanggal seperti `tglSertifikat`, `tglMulai`, dan `tglSelesai` ditampilkan dalam format ISO (UTC).
- Data `dosen` hanya menampilkan ID dan nama untuk efisiensi.

```
