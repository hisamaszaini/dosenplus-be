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
