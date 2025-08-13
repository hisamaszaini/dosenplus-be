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
| Field       | Tipe    | Wajib | Keterangan                                                 |
| ----------- | ------- | ----- | ---------------------------------------------------------- |
| file        | File    | Ya    | File PDF bukti kegiatan                                    |
| semesterId  | Integer | Ya    | ID Semester                                                |
| kategori    | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `PERKULIAHAN`) |
| mataKuliah  | String  | Ya    | Nama mata kuliah                                           |
| sks         | Integer | Ya    | Jumlah SKS                                                 |
| jumlahKelas | Integer | Ya    | Jumlah kelas diajar                                        |
| prodiId     | Integer | Ya    | ID Program Studi                                           |
| fakultasId  | Integer | Ya    | ID Fakultas                                                |

**Contoh Body (form-data)**

Form-Data:

- **file**: File bukti perkuliahan (wajib, format `.pdf`)
- **data**: JSON string berisi data perkuliahan. Contoh:
  ```json
  {
    "semesterId": 11,
    "kategori": "PERKULIAHAN",
    "mataKuliah": "Algoritma dan Struktur Data",
    "sks": 3,
    "jumlahKelas": 3,
    "prodiId": 1,
    "fakultasId": 1
  }
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
| Field       | Tipe    | Wajib | Keterangan                                               |
| ----------- | ------- | ----- | -------------------------------------------------------- |
| file        | File    | Tidak | File PDF bukti kegiatan (opsional)                       |
| semesterId  | Integer | Ya    | ID Semester                                              |
| kategori    | String  | Ya    | Pilih dari enum `KategoriKegiatan` (misal `PERKULIAHAN`) |
| mataKuliah  | String  | Ya    | Nama mata kuliah                                         |
| sks         | Integer | Ya    | Jumlah SKS                                               |
| jumlahKelas | Integer | Ya    | Jumlah kelas diajar                                      |
| prodiId     | Integer | Ya    | ID Program Studi                                         |
| fakultasId  | Integer | Ya    | ID Fakultas                                              |

Form-Data:

- **file**: File bukti perkuliahan (opsional, format `.pdf`)
- **data**: JSON string berisi data perkuliahan. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PERKULIAHAN",
    "mataKuliah": "Algoritma dan Struktur Data",
    "sks": 3,
    "jumlahKelas": 3,
    "prodiId": 1,
    "fakultasId": 1
  }
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
| Field      | Tipe    | Wajib | Keterangan                                                       |
| ---------- | ------- | ----- | ---------------------------------------------------------------- |
| file       | File    | Ya    | File PDF bukti kegiatan                                          |
| semesterId | Integer | Ya    | ID Semester                                                      |
| kategori   | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_SEMINAR`) |
| prodiId    | Integer | Ya    | ID Program Studi                                                 |
| fakultasId | Integer | Ya    | ID Fakultas                                                      |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                  |

Form-Data:

- **file**: File bukti bimbingan seminar (wajib, format `.pdf`)
- **data**: JSON string berisi data bimbingan seminar. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_SEMINAR",
    "prodiId": 1,
    "fakultasId": 1,
    "jumlahMhs": 10
  }
  ```

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
| Field      | Tipe    | Wajib | Keterangan                                                       |
| ---------- | ------- | ----- | ---------------------------------------------------------------- |
| file       | File    | Tidak | File PDF bukti kegiatan (opsional)                               |
| semesterId | Integer | Ya    | ID Semester                                                      |
| kategori   | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_SEMINAR`) |
| prodiId    | Integer | Ya    | ID Program Studi                                                 |
| fakultasId | Integer | Ya    | ID Fakultas                                                      |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                  |

**Contoh Body (form-data)**  

- **file**: File bukti bimbingan seminar (wajib, format `.pdf`)
- **data**: JSON string berisi data bimbingan seminar. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_SEMINAR",
    "prodiId": 1,
    "fakultasId": 1,
    "jumlahMhs": 8
  }
  ```

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

## Create Pelaksanaan Pendidikan - BIMBINGAN_KKN_PKN_PKL

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **BIMBINGAN_KKN_PKN_PKL** (misal: KKN, PKN, PKL).  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                                           |
| ---------- | ------- | ----- | -------------------------------------------------------------------- |
| file       | File    | Ya    | File PDF bukti kegiatan                                              |
| semesterId | Integer | Ya    | ID Semester                                                          |
| kategori   | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_KKN_PKN_PKL`) |
| jenis      | String  | Ya    | Jenis bimbingan (`KKN`, `PKN`, atau `PKL`)                           |
| prodiId    | Integer | Ya    | ID Program Studi                                                     |
| fakultasId | Integer | Ya    | ID Fakultas                                                          |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                      |

**Form-Data:**

- **file**: File bukti bimbingan KKN/PKN/PKL (wajib, format `.pdf`)
- **data**: JSON string berisi data bimbingan. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_KKN_PKN_PKL",
    "jenis": "KKN",
    "prodiId": 1,
    "fakultasId": 1,
    "jumlahMhs": 20
  }
  ```
---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 23,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_KKN_PKN_PKL",
    "nilaiPak": 20,
    "filePath": "pendidikan/6e5a7c8f-f91f-49b4-a77d-29f2a3785eb6.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T04:27:54.692Z",
    "updatedAt": "2025-08-12T04:27:54.692Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - BIMBINGAN_KKN_PKN_PKL

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **BIMBINGAN_KKN_PKN_PKL** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                                           |
| ---------- | ------- | ----- | -------------------------------------------------------------------- |
| file       | File    | Tidak | File PDF bukti kegiatan (opsional)                                   |
| semesterId | Integer | Ya    | ID Semester                                                          |
| kategori   | String  | Ya    | Pilih dari enum `KategoriKegiatan` (contoh: `BIMBINGAN_KKN_PKN_PKL`) |
| jenis      | String  | Ya    | Jenis bimbingan (`KKN`, `PKN`, atau `PKL`)                           |
| prodiId    | Integer | Ya    | ID Program Studi                                                     |
| fakultasId | Integer | Ya    | ID Fakultas                                                          |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                      |

**Contoh Body (form-data)**  
- **file**: File bukti bimbingan KKN/PKN/PKL (opsional, format `.pdf`)
- **data**: JSON string berisi data bimbingan. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_KKN_PKN_PKL",
    "jenis": "KKN",
    "prodiId": 1,
    "fakultasId": 1,
    "jumlahMhs": 19
  }
  ```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 23,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_KKN_PKN_PKL",
    "nilaiPak": 19,
    "filePath": "pendidikan/6e5a7c8f-f91f-49b4-a77d-29f2a3785eb6.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T04:27:54.692Z",
    "updatedAt": "2025-08-12T04:32:53.456Z"
  }
}
```

---

**Catatan**  
- Jika file tidak diupload saat update, file lama tetap dipertahankan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.  
- `nilaiPak` dihitung otomatis berdasarkan data terbaru.

## Create Pelaksanaan Pendidikan - BIMBINGAN_TUGAS_AKHIR

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **BIMBINGAN_TUGAS_AKHIR** (misal: Skripsi, Tesis, Disertasi).  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                                          |
| ---------- | ------- | ----- | ------------------------------------------------------------------- |
| file       | File    | Ya    | File PDF bukti kegiatan                                             |
| semesterId | Integer | Ya    | ID Semester                                                         |
| kategori   | String  | Ya    | Nilai harus `BIMBINGAN_TUGAS_AKHIR`                                 |
| jenis      | String  | Ya    | Jenis tugas akhir (`Skripsi`, `Tesis`, `Disertasi`)                 |
| peran      | String  | Ya    | Peran dalam bimbingan (`Pembimbing Utama`, `Pembimbing Pendamping`) |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                     |

**Contoh Body (form-data)**  

- **file**: File bukti bimbingan tugas akhir (wajib, format `.pdf`)
- **data**: JSON string berisi data bimbingan tugas akhir. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_TUGAS_AKHIR",
    "jenis": "Disertasi",
    "peran": "Pembimbing Utama",
    "jumlahMhs": 2
  }
  ```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 24,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_TUGAS_AKHIR",
    "nilaiPak": 16,
    "filePath": "pendidikan/1630c83c-810f-4046-ba5a-fe02021384b8.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:46:02.613Z",
    "updatedAt": "2025-08-12T07:46:02.613Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - BIMBINGAN_TUGAS_AKHIR

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **BIMBINGAN_TUGAS_AKHIR** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                                          |
| ---------- | ------- | ----- | ------------------------------------------------------------------- |
| file       | File    | Tidak | File PDF bukti kegiatan (opsional)                                  |
| semesterId | Integer | Ya    | ID Semester                                                         |
| kategori   | String  | Ya    | Nilai harus `BIMBINGAN_TUGAS_AKHIR`                                 |
| jenis      | String  | Ya    | Jenis tugas akhir (`Skripsi`, `Tesis`, `Disertasi`)                 |
| peran      | String  | Ya    | Peran dalam bimbingan (`Pembimbing Utama`, `Pembimbing Pendamping`) |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa yang dibimbing                                     |

**Contoh Body (form-data)**  
- **file**: File bukti bimbingan tugas akhir (opsional, format `.pdf`)
- **data**: JSON string berisi data bimbingan tugas akhir. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BIMBINGAN_TUGAS_AKHIR",
    "jenis": "Disertasi",
    "peran": "Pembimbing Pendamping",
    "jumlahMhs": 2
  }
  ```


---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 24,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BIMBINGAN_TUGAS_AKHIR",
    "nilaiPak": 12,
    "filePath": "pendidikan/1630c83c-810f-4046-ba5a-fe02021384b8.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:46:02.613Z",
    "updatedAt": "2025-08-12T07:47:59.506Z"
  }
}
```

---

**Catatan**  
- `nilaiPak` otomatis menyesuaikan berdasarkan `peran` dan `jumlahMhs`.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.

## Create Pelaksanaan Pendidikan - PENGUJI_UJIAN_AKHIR

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **PENGUJI_UJIAN_AKHIR** (misal: Skripsi, Tesis, Disertasi).  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                 |
| ---------- | ------- | ----- | ------------------------------------------ |
| file       | File    | Ya    | File PDF bukti kegiatan                    |
| semesterId | Integer | Ya    | ID Semester                                |
| kategori   | String  | Ya    | Nilai harus `PENGUJI_UJIAN_AKHIR`          |
| peran      | String  | Ya    | Peran (`Ketua Penguji`, `Anggota Penguji`) |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa diuji                     |

**Contoh Body (form-data)**  

- **file**: File bukti penguji ujian akhir (wajib, format `.pdf`)
- **data**: JSON string berisi data penguji ujian akhir. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PENGUJI_UJIAN_AKHIR",
    "peran": "Ketua Penguji",
    "jumlahMhs": 1
  }
  ```
---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 25,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PENGUJI_UJIAN_AKHIR",
    "nilaiPak": 1,
    "filePath": "pendidikan/e0625fe2-a77f-4264-93ca-101d723aedbd.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:52:12.072Z",
    "updatedAt": "2025-08-12T07:52:12.072Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - PENGUJI_UJIAN_AKHIR

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **PENGUJI_UJIAN_AKHIR** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field      | Tipe    | Wajib | Keterangan                                 |
| ---------- | ------- | ----- | ------------------------------------------ |
| file       | File    | Tidak | File PDF bukti kegiatan (opsional)         |
| semesterId | Integer | Ya    | ID Semester                                |
| kategori   | String  | Ya    | Nilai harus `PENGUJI_UJIAN_AKHIR`          |
| peran      | String  | Ya    | Peran (`Ketua Penguji`, `Anggota Penguji`) |
| jumlahMhs  | Integer | Ya    | Jumlah mahasiswa diuji                     |

**Contoh Body (form-data)**  
- **file**: File bukti penguji ujian akhir (opsional, format `.pdf`)
- **data**: JSON string berisi data penguji ujian akhir. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PENGUJI_UJIAN_AKHIR",
    "peran": "Anggota Penguji",
    "jumlahMhs": 4
  }
  ```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 25,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PENGUJI_UJIAN_AKHIR",
    "nilaiPak": 2,
    "filePath": "pendidikan/e0625fe2-a77f-4264-93ca-101d723aedbd.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:52:12.072Z",
    "updatedAt": "2025-08-12T07:54:23.326Z"
  }
}
```

---

**Catatan**  
- `nilaiPak` otomatis dihitung berdasarkan `peran` dan `jumlahMhs`.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.

## Create Pelaksanaan Pendidikan - PEMBINA_KEGIATAN_MHS

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **PEMBINA_KEGIATAN_MHS**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field        | Tipe    | Wajib | Keterangan                         |
| ------------ | ------- | ----- | ---------------------------------- |
| file         | File    | Ya    | File PDF bukti kegiatan            |
| semesterId   | Integer | Ya    | ID Semester                        |
| kategori     | String  | Ya    | Nilai harus `PEMBINA_KEGIATAN_MHS` |
| namaKegiatan | String  | Ya    | Nama kegiatan yang dibina          |
| luaran       | String  | Ya    | Hasil/luaran kegiatan              |

**Contoh Body (form-data)**  
```
file: (upload PDF)
semesterId: 14
kategori: PEMBINA_KEGIATAN_MHS
namaKegiatan: Pembinaan UKM Robotika
luaran: Lomba Robot Nasional
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 26,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PEMBINA_KEGIATAN_MHS",
    "nilaiPak": 2,
    "filePath": "pendidikan/512954fa-609d-40ef-8b54-15ed18576b90.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:58:30.348Z",
    "updatedAt": "2025-08-12T07:58:30.348Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - PEMBINA_KEGIATAN_MHS

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **PEMBINA_KEGIATAN_MHS** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field        | Tipe    | Wajib | Keterangan                         |
| ------------ | ------- | ----- | ---------------------------------- |
| file         | File    | Tidak | File PDF bukti kegiatan (opsional) |
| semesterId   | Integer | Ya    | ID Semester                        |
| kategori     | String  | Ya    | Nilai harus `PEMBINA_KEGIATAN_MHS` |
| namaKegiatan | String  | Ya    | Nama kegiatan yang dibina          |
| luaran       | String  | Ya    | Hasil/luaran kegiatan              |

**Contoh Body (form-data)**  
```
file: (upload PDF, opsional)
semesterId: 14
kategori: PEMBINA_KEGIATAN_MHS
namaKegiatan: Pembinaan UKM Sepak Bola
luaran: Lomba Sepak Bola Nasional
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 26,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PEMBINA_KEGIATAN_MHS",
    "nilaiPak": 2,
    "filePath": "pendidikan/512954fa-609d-40ef-8b54-15ed18576b90.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T07:58:30.348Z",
    "updatedAt": "2025-08-12T08:00:00.971Z"
  }
}
```

---

**Catatan**  
- `nilaiPak` otomatis dihitung oleh sistem.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.

## Create Pelaksanaan Pendidikan - PENGEMBANGAN_PROGRAM

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **PENGEMBANGAN_PROGRAM**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field               | Tipe    | Wajib | Keterangan                         |
| ------------------- | ------- | ----- | ---------------------------------- |
| file                | File    | Ya    | File PDF bukti kegiatan            |
| semesterId          | Integer | Ya    | ID Semester                        |
| kategori            | String  | Ya    | Nilai harus `PENGEMBANGAN_PROGRAM` |
| mataKuliah          | String  | Ya    | Nama mata kuliah yang dikembangkan |
| programPengembangan | String  | Ya    | Deskripsi program pengembangan     |
| prodiId             | Integer | Ya    | ID Program Studi                   |
| fakultasId          | Integer | Ya    | ID Fakultas                        |

**Contoh Body (form-data)**  
```
file: (upload PDF)
semesterId: 14
kategori: PENGEMBANGAN_PROGRAM
mataKuliah: Algoritma dan Struktur Data
programPengembangan: Pengembangan Modul Pembelajaran Interaktif
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
    "id": 27,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PENGEMBANGAN_PROGRAM",
    "nilaiPak": 2,
    "filePath": "pendidikan/16ba1187-9144-46b0-8eae-5f1c23bd7199.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T08:05:11.483Z",
    "updatedAt": "2025-08-12T08:05:11.483Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - PENGEMBANGAN_PROGRAM

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **PENGEMBANGAN_PROGRAM** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field               | Tipe    | Wajib | Keterangan                         |
| ------------------- | ------- | ----- | ---------------------------------- |
| file                | File    | Tidak | File PDF bukti kegiatan (opsional) |
| semesterId          | Integer | Ya    | ID Semester                        |
| kategori            | String  | Ya    | Nilai harus `PENGEMBANGAN_PROGRAM` |
| mataKuliah          | String  | Ya    | Nama mata kuliah yang dikembangkan |
| programPengembangan | String  | Ya    | Deskripsi program pengembangan     |
| prodiId             | Integer | Ya    | ID Program Studi                   |
| fakultasId          | Integer | Ya    | ID Fakultas                        |

**Contoh Body (form-data)**  
```
file: (upload PDF, opsional)
semesterId: 14
kategori: PENGEMBANGAN_PROGRAM
mataKuliah: Algoritma dan Struktur Data
programPengembangan: Pengembangan Modul Pembelajaran Interaktif dan Efektif
prodiId: 6
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
    "id": 27,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "PENGEMBANGAN_PROGRAM",
    "nilaiPak": 2,
    "filePath": "pendidikan/16ba1187-9144-46b0-8eae-5f1c23bd7199.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T08:05:11.483Z",
    "updatedAt": "2025-08-12T08:07:04.324Z"
  }
}
```

---

**Catatan**  
- `nilaiPak` otomatis dihitung oleh sistem.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.

## Create Pelaksanaan Pendidikan - BAHAN_PENGAJARAN

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **BAHAN_PENGAJARAN**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field         | Tipe    | Wajib | Keterangan                                 |
| ------------- | ------- | ----- | ------------------------------------------ |
| file          | File    | Ya    | File PDF bukti kegiatan                    |
| semesterId    | Integer | Ya    | ID Semester                                |
| kategori      | String  | Ya    | Nilai harus `BAHAN_PENGAJARAN`             |
| jenis         | String  | Ya    | Jenis bahan pengajaran (`BUKU_AJAR`, dsb.) |
| judul         | String  | Ya    | Judul bahan pengajaran                     |
| tglTerbit     | Date    | Ya    | Tanggal terbit dalam format `YYYY-MM-DD`   |
| penerbit      | String  | Ya    | Nama penerbit                              |
| jumlahHalaman | Integer | Ya    | Jumlah halaman                             |
| isbn          | String  | Ya    | Nomor ISBN                                 |

**Contoh Body (form-data)**  
```
file: (upload PDF)
semesterId: 14
kategori: BAHAN_PENGAJARAN
jenis: BUKU_AJAR
judul: Pengantar Algoritma dan Pemrograman
tglTerbit: 2025-01-15
penerbit: Penerbit Teknologi Nusantara
jumlahHalaman: 250
isbn: 978-602-1234-56-7
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 29,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/230dd95b-01da-42b8-9c1e-71ef035e6953.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T08:45:19.830Z",
    "updatedAt": "2025-08-12T08:45:19.830Z"
  }
}
```

---

## Update Pelaksanaan Pendidikan - BAHAN_PENGAJARAN

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data pelaksanaan pendidikan kategori **BAHAN_PENGAJARAN** berdasarkan `id`.  
File PDF **opsional** untuk diupload ulang.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field         | Tipe    | Wajib | Keterangan                                 |
| ------------- | ------- | ----- | ------------------------------------------ |
| file          | File    | Tidak | File PDF bukti kegiatan (opsional)         |
| semesterId    | Integer | Ya    | ID Semester                                |
| kategori      | String  | Ya    | Nilai harus `BAHAN_PENGAJARAN`             |
| jenis         | String  | Ya    | Jenis bahan pengajaran (`BUKU_AJAR`, dsb.) |
| judul         | String  | Ya    | Judul bahan pengajaran                     |
| tglTerbit     | Date    | Ya    | Tanggal terbit dalam format `YYYY-MM-DD`   |
| penerbit      | String  | Ya    | Nama penerbit                              |
| jumlahHalaman | Integer | Ya    | Jumlah halaman                             |
| isbn          | String  | Ya    | Nomor ISBN                                 |

**Contoh Body (form-data)**  
```
file: (upload PDF, opsional)
semesterId: 14
kategori: BAHAN_PENGAJARAN
jenis: BUKU_AJAR
judul: Pengantar Algoritma dan Pemrograman
tglTerbit: 2025-01-15
penerbit: Penerbit Teknologi Jatim
jumlahHalaman: 250
isbn: 978-602-1234-56-7
```

---

### Response

**Status: 200 OK**  
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 29,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/230dd95b-01da-42b8-9c1e-71ef035e6953.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-12T08:45:19.830Z",
    "updatedAt": "2025-08-12T09:43:04.351Z",
    "bahanPengajaran": {
      "id": 1,
      "pelaksanaanId": 29,
      "jenis": "BUKU_AJAR",
      "bukuAjarId": 5,
      "produkLainId": null,
      "bukuAjar": {
        "id": 5,
        "judul": "Pengantar Algoritma dan Pemrograman",
        "tglTerbit": "2025-01-15T00:00:00.000Z",
        "penerbit": "Penerbit Teknologi Jatim",
        "jumlahHalaman": 250,
        "isbn": "978-602-1234-56-7"
      },
      "produkLain": null
    }
  }
}
```

---

**Catatan**  
- `nilaiPak` otomatis dihitung oleh sistem.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.
