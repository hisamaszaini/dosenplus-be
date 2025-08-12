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
