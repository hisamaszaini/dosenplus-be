## Create Pelaksanaan Pendidikan - Perkuliahan

**Endpoint**
```
POST 127.0.0.1:3000/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **PERKULIAHAN**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**
| Field        | Tipe    | Wajib | Keterangan |
|--------------|---------|-------|------------|
| file         | File    | Ya    | File PDF bukti kegiatan |
| semesterId   | Integer | Ya    | ID Semester |
| kategori     | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `PERKULIAHAN`) |
| mataKuliah   | String  | Ya    | Nama mata kuliah |
| sks          | Integer | Ya    | Jumlah SKS |
| jumlahKelas  | Integer | Ya    | Jumlah kelas diajar |
| prodiId      | Integer | Ya    | ID Program Studi |
| fakultasId   | Integer | Ya    | ID Fakultas |

**Contoh Body (form-data)**
```
file: (upload PDF)
semesterId: 11
kategori: PERKULIAHAN
mataKuliah: Algoritma dan Struktur Data
sks: 3
jumlahKelas: 3
prodiId: 1
fakultasId: 1
```

---

### Response

**Status: 200 OK**
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 20,
    "dosenId": 5,
    "semesterId": 11,
    "kategori": "PERKULIAHAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/ea8ecfd4-5407-4214-b2c0-ed45e3b2644c.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-11T14:41:17.254Z",
    "updatedAt": "2025-08-11T14:41:17.254Z"
  }
}
```

---

**Catatan**
- `statusValidasi` default `PENDING`.
- File hanya mendukung format **PDF**.
- `nilaiPak` dihitung otomatis oleh sistem.

## Update Pelaksanaan Pendidikan

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang, jika tidak ingin mengganti file, tidak perlu upload.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field        | Tipe    | Wajib | Keterangan                                |
|--------------|---------|-------|-------------------------------------------|
| file         | File    | Tidak | File PDF bukti kegiatan (opsional)         |
| semesterId   | Integer | Ya    | ID Semester                               |
| kategori     | String  | Ya    | Pilih dari enum `KategoriKegiatan` (misal `PERKULIAHAN`) |
| mataKuliah   | String  | Ya    | Nama mata kuliah                          |
| sks          | Integer | Ya    | Jumlah SKS                               |
| jumlahKelas  | Integer | Ya    | Jumlah kelas diajar                       |
| prodiId      | Integer | Ya    | ID Program Studi                         |
| fakultasId   | Integer | Ya    | ID Fakultas                              |

**Contoh Body (form-data)**  
```
file: (upload PDF, opsional)
semesterId: 14
kategori: PERKULIAHAN
mataKuliah: Algoritma dan Struktur Data
sks: 3
jumlahKelas: 3
prodiId: 1
fakultasId: 1
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 21,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PERKULIAHAN",
    "nilaiPak": 9,
    "filePath": "pendidikan/0b72f79e-e4c0-4a2d-8fb3-f3584c863994.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T03:45:14.867Z",
    "updatedAt": "2025-08-12T03:55:43.988Z"
  }
}
```

---

**Catatan**  
- Jika `file` tidak diupload, file lama tetap dipertahankan.  
- Setelah update, `statusValidasi` akan kembali ke `PENDING`.  
- `nilaiPak` dihitung otomatis oleh sistem.

## Create Pelaksanaan Pendidikan - BIMBINGAN_SEMINAR

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **BIMBINGAN_SEMINAR**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field        | Tipe    | Wajib | Keterangan                            |
|--------------|---------|-------|-------------------------------------|
| file         | File    | Ya    | File PDF bukti kegiatan              |
| semesterId   | Integer | Ya    | ID Semester                         |
| kategori     | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_SEMINAR`) |
| prodiId      | Integer | Ya    | ID Program Studi                   |
| fakultasId   | Integer | Ya    | ID Fakultas                        |
| jumlahMhs    | Integer | Ya    | Jumlah mahasiswa yang dibimbing     |

**Contoh Body (form-data)**  
```
file: (upload PDF)
semesterId: 14
kategori: BIMBINGAN_SEMINAR
prodiId: 1
fakultasId: 1
jumlahMhs: 10
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 22,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_SEMINAR",
    "nilaiPak": 10,
    "filePath": "pendidikan/8a97c6a1-5fe9-4a73-aea7-149e8528071f.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T04:22:00.670Z",
    "updatedAt": "2025-08-12T04:22:00.670Z"
  }
}
```

---

**Catatan**  
- `nilaiPak` dihitung otomatis berdasarkan kategori dan data input.  
- File hanya mendukung format **PDF**.  
- `statusValidasi` default `PENDING`.  

## Update Pelaksanaan Pendidikan - BIMBINGAN_SEMINAR

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **BIMBINGAN_SEMINAR** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field        | Tipe    | Wajib | Keterangan                                |
|--------------|---------|-------|-------------------------------------------|
| file         | File    | Tidak | File PDF bukti kegiatan (opsional)         |
| semesterId   | Integer | Ya    | ID Semester                               |
| kategori     | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_SEMINAR`) |
| prodiId      | Integer | Ya    | ID Program Studi                         |
| fakultasId   | Integer | Ya    | ID Fakultas                              |
| jumlahMhs    | Integer | Ya    | Jumlah mahasiswa yang dibimbing           |

**Contoh Body (form-data)**  
```
file: (upload PDF, opsional)
semesterId: 14
kategori: BIMBINGAN_SEMINAR
prodiId: 1
fakultasId: 1
jumlahMhs: 8
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 22,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_SEMINAR",
    "nilaiPak": 8,
    "filePath": "pendidikan/8a97c6a1-5fe9-4a73-aea7-149e8528071f.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T04:22:00.670Z",
    "updatedAt": "2025-08-12T04:24:30.729Z"
  }
}
```

---

**Catatan**  
- Jika file tidak diupload, file lama tetap dipertahankan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.  
- `nilaiPak` dihitung otomatis berdasarkan data terbaru.
