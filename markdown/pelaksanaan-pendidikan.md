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
        "id": 45,
        "dosenId": 5,
        "semesterId": 11,
        "kategori": "PERKULIAHAN",
        "nilaiPak": 4.5,
        "filePath": "pendidikan/c0cb60c6-9853-48b7-af94-51b776025a07.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:12:48.249Z",
        "updatedAt": "2025-08-15T02:12:48.249Z",
        "perkuliahan": {
            "id": 10,
            "pelaksanaanId": 45,
            "mataKuliah": "Algoritma dan Struktur Data",
            "sks": 3,
            "jumlahKelas": 3,
            "totalSks": 9,
            "prodiId": 1,
            "fakultasId": 1
        }
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
        "id": 45,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PERKULIAHAN",
        "nilaiPak": 5,
        "filePath": "pendidikan/c0cb60c6-9853-48b7-af94-51b776025a07.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:12:48.249Z",
        "updatedAt": "2025-08-15T02:13:23.358Z",
        "perkuliahan": {
            "id": 10,
            "pelaksanaanId": 45,
            "mataKuliah": "Algoritma dan Struktur Data",
            "sks": 3,
            "jumlahKelas": 3,
            "totalSks": 9,
            "prodiId": 1,
            "fakultasId": 1
        }
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
        "id": 46,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "BIMBINGAN_SEMINAR",
        "nilaiPak": 10,
        "filePath": "pendidikan/67003db5-e63f-45ce-a8c4-962c0c983097.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:14:16.582Z",
        "updatedAt": "2025-08-15T02:14:16.582Z",
        "bimbinganSeminar": {
            "id": 3,
            "pelaksanaanId": 46,
            "prodiId": 1,
            "fakultasId": 1,
            "jumlahMhs": 10
        }
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
        "id": 46,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "BIMBINGAN_SEMINAR",
        "nilaiPak": 8,
        "filePath": "pendidikan/67003db5-e63f-45ce-a8c4-962c0c983097.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:14:16.582Z",
        "updatedAt": "2025-08-15T02:14:59.309Z",
        "bimbinganSeminar": {
            "id": 3,
            "pelaksanaanId": 46,
            "prodiId": 1,
            "fakultasId": 1,
            "jumlahMhs": 8
        }
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
        "id": 47,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "BIMBINGAN_KKN_PKN_PKL",
        "nilaiPak": 20,
        "filePath": "pendidikan/d88f61c1-d99d-4ea1-92a0-3998a6294ebf.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:18:09.873Z",
        "updatedAt": "2025-08-15T02:18:09.873Z",
        "bimbinganKknPknPkl": {
            "id": 3,
            "pelaksanaanId": 47,
            "jenis": "KKN",
            "prodiId": 1,
            "fakultasId": 1,
            "jumlahMhs": 20
        }
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
        "id": 47,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "BIMBINGAN_KKN_PKN_PKL",
        "nilaiPak": 19,
        "filePath": "pendidikan/d88f61c1-d99d-4ea1-92a0-3998a6294ebf.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:18:09.873Z",
        "updatedAt": "2025-08-15T02:18:52.280Z",
        "bimbinganKknPknPkl": {
            "id": 3,
            "pelaksanaanId": 47,
            "jenis": "KKN",
            "prodiId": 1,
            "fakultasId": 1,
            "jumlahMhs": 19
        }
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
        "id": 48,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "BIMBINGAN_TUGAS_AKHIR",
        "nilaiPak": 16,
        "filePath": "pendidikan/6efa7c8a-ebdd-4032-a6a0-2934ba4a4fb9.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:20:53.707Z",
        "updatedAt": "2025-08-15T02:20:53.707Z",
        "bimbinganTugasAkhir": {
            "id": 3,
            "pelaksanaanId": 48,
            "jenis": "Disertasi",
            "peran": "Pembimbing Utama",
            "jumlahMhs": 2
        }
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
        "updatedAt": "2025-08-15T02:21:26.561Z",
        "bimbinganTugasAkhir": {
            "id": 1,
            "pelaksanaanId": 24,
            "jenis": "Disertasi",
            "peran": "Pembimbing Pendamping",
            "jumlahMhs": 2
        }
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
        "id": 49,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PENGUJI_UJIAN_AKHIR",
        "nilaiPak": 1,
        "filePath": "pendidikan/b7e46cea-8485-411e-99c8-6f474c3210be.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:22:07.853Z",
        "updatedAt": "2025-08-15T02:22:07.853Z",
        "pengujiUjianAkhir": {
            "id": 2,
            "pelaksanaanId": 49,
            "peran": "Ketua Penguji",
            "jumlahMhs": 1
        }
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
        "id": 49,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PENGUJI_UJIAN_AKHIR",
        "nilaiPak": 2,
        "filePath": "pendidikan/b7e46cea-8485-411e-99c8-6f474c3210be.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:22:07.853Z",
        "updatedAt": "2025-08-15T02:22:23.809Z",
        "pengujiUjianAkhir": {
            "id": 2,
            "pelaksanaanId": 49,
            "peran": "Anggota Penguji",
            "jumlahMhs": 4
        }
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

- **file**: File bukti pembina kegiatan mahasiswa (wajib, format `.pdf`)
- **data**: JSON string berisi data pembina kegiatan mahasiswa. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PEMBINA_KEGIATAN_MHS",
    "namaKegiatan": "Pembinaan UKM Robotika",
    "luaran": "Lomba Robot Nasional"
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
        "id": 50,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PEMBINA_KEGIATAN_MHS",
        "nilaiPak": 2,
        "filePath": "pendidikan/93b91993-9e81-409b-b1be-cd59000b7c81.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:23:20.991Z",
        "updatedAt": "2025-08-15T02:23:20.991Z",
        "pembinaKegiatanMhs": {
            "id": 2,
            "pelaksanaanId": 50,
            "namaKegiatan": "Pembinaan UKM Robotika",
            "luaran": "Lomba Robot Nasional"
        }
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
- **file**: File bukti pembina kegiatan mahasiswa (opsional, format `.pdf`)
- **data**: JSON string berisi data pembina kegiatan mahasiswa. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PEMBINA_KEGIATAN_MHS",
    "namaKegiatan": "Pembinaan UKM Sepak Bola",
    "luaran": "Lomba Sepak Bola Nasional"
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
        "id": 50,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PEMBINA_KEGIATAN_MHS",
        "nilaiPak": 2,
        "filePath": "pendidikan/93b91993-9e81-409b-b1be-cd59000b7c81.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:23:20.991Z",
        "updatedAt": "2025-08-15T02:23:42.917Z",
        "pembinaKegiatanMhs": {
            "id": 2,
            "pelaksanaanId": 50,
            "namaKegiatan": "Pembinaan UKM Sepak Bola",
            "luaran": "Lomba Sepak Bola Nasional"
        }
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

- **file**: File bukti pengembangan program (wajib, format `.pdf`)
- **data**: JSON string berisi data pengembangan program. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PENGEMBANGAN_PROGRAM",
    "mataKuliah": "Algoritma dan Struktur Data",
    "programPengembangan": "Pengembangan Modul Pembelajaran Interaktif",
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
        "id": 51,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PENGEMBANGAN_PROGRAM",
        "nilaiPak": 2,
        "filePath": "pendidikan/3b5d6d88-e5db-479e-8da0-43e3c2107a33.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:24:42.472Z",
        "updatedAt": "2025-08-15T02:24:42.472Z",
        "pengembanganProgram": {
            "id": 2,
            "pelaksanaanId": 51,
            "programPengembangan": "Pengembangan Modul Pembelajaran Interaktif",
            "prodiId": 1,
            "fakultasId": 1,
            "mataKuliah": "Algoritma dan Struktur Data"
        }
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
- **file**: File bukti pengembangan program (opsional, format `.pdf`)
- **data**: JSON string berisi data pengembangan program. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "PENGEMBANGAN_PROGRAM",
    "mataKuliah": "Algoritma dan Struktur Data",
    "programPengembangan": "Pengembangan Modul Pembelajaran Interaktif dan Efektif",
    "prodiId": 6,
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
        "id": 51,
        "dosenId": 5,
        "semesterId": 14,
        "kategori": "PENGEMBANGAN_PROGRAM",
        "nilaiPak": 2,
        "filePath": "pendidikan/3b5d6d88-e5db-479e-8da0-43e3c2107a33.pdf",
        "statusValidasi": "PENDING",
        "catatan": null,
        "createdAt": "2025-08-15T02:24:42.472Z",
        "updatedAt": "2025-08-15T02:25:03.806Z",
        "pengembanganProgram": {
            "id": 2,
            "pelaksanaanId": 51,
            "programPengembangan": "Pengembangan Modul Pembelajaran Interaktif dan Efektif",
            "prodiId": 6,
            "fakultasId": 1,
            "mataKuliah": "Algoritma dan Struktur Data"
        }
    }
}
```

---

**Catatan**  
- `nilaiPak` otomatis dihitung oleh sistem.  
- Jika file tidak diupload saat update, file lama akan tetap digunakan.  
- `statusValidasi` akan kembali ke `PENDING` setelah update.

## Create Pelaksanaan Pendidikan - BAHAN_PENGAJARAN (Kategori: PRODUK_LAIN)

**Endpoint**  
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
```

**Deskripsi**  
Membuat record pelaksanaan pendidikan kategori **BAHAN_PENGAJARAN** dengan jenis **PRODUK_LAIN**.  
File PDF **wajib** dilampirkan.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field         | Tipe    | Wajib | Keterangan                                                                 |
| ------------- | ------- | ----- | -------------------------------------------------------------------------- |
| file          | File    | Ya    | File PDF bukti kegiatan                                                    |
| semesterId    | Integer | Ya    | ID Semester                                                                |
| kategori      | String  | Ya    | Nilai harus `BAHAN_PENGAJARAN`                                             |
| jenis         | String  | Ya    | Harus diisi `PRODUK_LAIN`                                                  |
| jenisProduk   | String  | Ya    | Pilihan: `Diktat`, `Modul`, `Petunjuk praktikum`, `Model`, `Alat bantu`, `Audio visual`, `Naskah tutorial`, `Job sheet praktikum` |
| judul         | String  | Ya    | Judul produk                                                               |
| jumlahHalaman | Integer | Ya    | Jumlah halaman                                                             |
| mataKuliah    | String  | Ya    | Nama mata kuliah terkait                                                   |
| prodiId       | Integer | Ya    | ID program studi                                                           |
| fakultasId    | Integer | Ya    | ID fakultas                                                                |

**Contoh Body (form-data)**  

- **file**: File bukti (wajib, format `.pdf`)  
- **data**: JSON string berisi data. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "jenis": "PRODUK_LAIN",
    "jenisProduk": "Modul",
    "judul": "Modul Praktikum Basis Data",
    "jumlahHalaman": 80,
    "mataKuliah": "Basis Data",
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
    "id": 37,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/6e583ca9-f706-446c-9e08-2ae4b568387a.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T00:48:34.146Z",
    "updatedAt": "2025-08-15T00:48:34.146Z",
    "bahanPengajaran": {
      "id": 3,
      "pelaksanaanId": 37,
      "jenis": "PRODUK_LAIN",
      "bukuAjarId": null,
      "produkLainId": 4,
      "bukuAjar": null,
      "produkLain": {
        "id": 4,
        "jenisProduk": "Modul",
        "judul": "Modul Praktikum Basis Data",
        "jumlahHalaman": 80,
        "mataKuliah": "Basis Data",
        "prodiId": 1,
        "fakultasId": 1
      }
    }
  }
}
```

---

## Update Pelaksanaan Pendidikan - BAHAN_PENGAJARAN (Kategori: PRODUK_LAIN)

**Endpoint**  
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:id
```

**Deskripsi**  
Memperbarui data kategori **PRODUK_LAIN** berdasarkan `id`.  
File PDF **opsional**.

---

### Request

**Headers**  
```
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

**Form Data**  
| Field         | Tipe    | Wajib | Keterangan                                                                 |
| ------------- | ------- | ----- | -------------------------------------------------------------------------- |
| file          | File    | Tidak | File PDF bukti kegiatan (opsional)                                         |
| semesterId    | Integer | Ya    | ID Semester                                                                |
| kategori      | String  | Ya    | Nilai harus `BAHAN_PENGAJARAN`                                             |
| jenis         | String  | Ya    | Harus diisi `PRODUK_LAIN`                                                  |
| jenisProduk   | String  | Ya    | Pilihan: `Diktat`, `Modul`, `Petunjuk praktikum`, `Model`, `Alat bantu`, `Audio visual`, `Naskah tutorial`, `Job sheet praktikum` |
| judul         | String  | Ya    | Judul produk                                                               |
| jumlahHalaman | Integer | Ya    | Jumlah halaman                                                             |
| mataKuliah    | String  | Ya    | Nama mata kuliah terkait                                                   |
| prodiId       | Integer | Ya    | ID program studi                                                           |
| fakultasId    | Integer | Ya    | ID fakultas                                                                |

**Contoh Body (form-data)**  

- **file**: File bukti (opsional, format `.pdf`)  
- **data**: JSON string berisi data. Contoh:
  ```json
  {
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "jenis": "PRODUK_LAIN",
    "jenisProduk": "Modul",
    "judul": "Modul Praktikum Pemrograman Web Lanjut",
    "jumlahHalaman": 80,
    "mataKuliah": "Pemrograman Web Lanjut",
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
    "id": 37,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/6e583ca9-f706-446c-9e08-2ae4b568387a.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T00:48:34.146Z",
    "updatedAt": "2025-08-15T00:48:34.146Z",
    "bahanPengajaran": {
      "id": 3,
      "pelaksanaanId": 37,
      "jenis": "PRODUK_LAIN",
      "bukuAjarId": null,
      "produkLainId": 4,
      "bukuAjar": null,
      "produkLain": {
        "id": 4,
        "jenisProduk": "Modul",
        "judul": "Modul Praktikum Pemrograman Web Lanjut",
        "jumlahHalaman": 80,
        "mataKuliah": "Pemrograman Web Lanjut",
        "prodiId": 1,
        "fakultasId": 1
      }
    }
  }
}
```

---

**Catatan**  
- `jenisProduk` wajib sesuai salah satu dari daftar enum.  
- `nilaiPak` dihitung otomatis.  
- File lama akan digunakan jika tidak ada unggahan baru.  
- Status validasi akan kembali ke `PENDING` setelah update.

## Pelaksanaan Pendidikan - Bahan Pengajaran (Kategori: BUKU_AJAR)

### Endpoint Create
```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:  
- `file` **wajib** (format PDF)  
- Body dikirim dalam bentuk `multipart/form-data` dengan field berikut:

```json
{
  "semesterId": 14,
  "kategori": "BAHAN_PENGAJARAN",
  "jenis": "BUKU_AJAR",
  "judul": "Pengantar Algoritma dan Pemrograman",
  "tglTerbit": "2025-01-15",
  "penerbit": "Penerbit Teknologi Nusantara",
  "jumlahHalaman": 250,
  "isbn": "978-602-1234-56-7"
}
```

**Response (201 - Created)**:
```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 38,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/beaafaf8-6072-4616-920b-09081e65e05a.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T00:54:01.002Z",
    "updatedAt": "2025-08-15T00:54:01.002Z",
    "bahanPengajaran": {
      "id": 4,
      "pelaksanaanId": 38,
      "jenis": "BUKU_AJAR",
      "bukuAjarId": 6,
      "produkLainId": null,
      "bukuAjar": {
        "id": 6,
        "judul": "Pengantar Algoritma dan Pemrograman",
        "tglTerbit": "2025-01-15T00:00:00.000Z",
        "penerbit": "Penerbit Teknologi Nusantara",
        "jumlahHalaman": 250,
        "isbn": "978-602-1234-56-7"
      },
      "produkLain": null
    }
  }
}
```

---

### Endpoint Update
```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:  
- `file` **opsional** (format PDF)  
- Body dikirim dalam bentuk `multipart/form-data` dengan field berikut:

```json
{
  "semesterId": 14,
  "kategori": "BAHAN_PENGAJARAN",
  "jenis": "BUKU_AJAR",
  "judul": "Pengantar Algoritma dan Pemrograman",
  "tglTerbit": "2025-01-15",
  "penerbit": "Penerbit Teknologi Indonesia",
  "jumlahHalaman": 250,
  "isbn": "978-602-1234-56-7"
}
```

**Response (200 - OK)**:
```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 38,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "BAHAN_PENGAJARAN",
    "nilaiPak": 5,
    "filePath": "pendidikan/beaafaf8-6072-4616-920b-09081e65e05a.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T00:54:01.002Z",
    "updatedAt": "2025-08-15T00:54:01.002Z",
    "bahanPengajaran": {
      "id": 4,
      "pelaksanaanId": 38,
      "jenis": "BUKU_AJAR",
      "bukuAjarId": 6,
      "produkLainId": null,
      "bukuAjar": {
        "id": 6,
        "judul": "Pengantar Algoritma dan Pemrograman",
        "tglTerbit": "2025-01-15T00:00:00.000Z",
        "penerbit": "Penerbit Teknologi Indonesia",
        "jumlahHalaman": 250,
        "isbn": "978-602-1234-56-7"
      },
      "produkLain": null
    }
  }
}
```

## Pelaksanaan Pendidikan - ORASI\_ILMIAH

### Endpoint Create

```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **wajib** (format PDF)
- Field `tingkat` harus salah satu dari enum:
  - `LOKAL`, `DAERAH`, `NASIONAL`, `INTERNASIONAL`
- Body dikirim dalam bentuk `multipart/form-data` dengan field berikut:

```json
{
  "semesterId": 14,
  "kategori": "ORASI_ILMIAH",
  "namaKegiatan": "Orasi Ilmiah Nasional Pendidikan Teknologi",
  "deskripsi": "Menyampaikan orasi tentang inovasi teknologi pendidikan di era digital.",
  "tingkat": "NASIONAL",
  "penyelenggara": "Universitas Teknologi Indonesia",
  "tgl": "2025-09-12"
}
```

**Response (201 - Created)**:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 40,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "ORASI_ILMIAH",
    "nilaiPak": 5,
    "filePath": "pendidikan/989488c6-06e4-43cb-a3df-9a45d30cd4ea.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:23:46.313Z",
    "updatedAt": "2025-08-15T01:23:46.313Z",
    "orasiIlmiah": {
      "id": 2,
      "pelaksanaanId": 40,
      "namaKegiatan": "Orasi Ilmiah Nasional Pendidikan Teknologi",
      "deskripsi": "Menyampaikan orasi tentang inovasi teknologi pendidikan di era digital.",
      "tingkat": "NASIONAL",
      "penyelenggara": "Universitas Teknologi Indonesia",
      "tgl": "2025-09-12T00:00:00.000Z"
    }
  }
}
```

### Endpoint Update

```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **opsional** (format PDF)
- Field `tingkat` harus salah satu dari enum:
  - `LOKAL`, `DAERAH`, `NASIONAL`, `INTERNASIONAL`

```json
{
  "semesterId": 1,
  "kategori": "ORASI_ILMIAH",
  "namaKegiatan": "Orasi Ilmiah Nasional Pendidikan Teknologi",
  "deskripsi": "Menyampaikan orasi tentang inovasi teknologi pendidikan di era digital.",
  "tingkat": "DAERAH",
  "penyelenggara": "Universitas Muhammadiyah Malang",
  "tgl": "2025-09-12"
}
```

**Response (200 - OK)**:

```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 40,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "ORASI_ILMIAH",
    "nilaiPak": 5,
    "filePath": "pendidikan/989488c6-06e4-43cb-a3df-9a45d30cd4ea.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:23:46.313Z",
    "updatedAt": "2025-08-15T01:24:19.824Z",
    "orasiIlmiah": {
      "id": 2,
      "pelaksanaanId": 40,
      "namaKegiatan": "Orasi Ilmiah Nasional Pendidikan Teknologi",
      "deskripsi": "Menyampaikan orasi tentang inovasi teknologi pendidikan di era digital.",
      "tingkat": "DAERAH",
      "penyelenggara": "Universitas Muhammadiyah Malang",
      "tgl": "2025-09-12T00:00:00.000Z"
    }
  }
}
```

---

## Pelaksanaan Pendidikan - JABATAN\_STRUKTURAL

### Endpoint Create

```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **wajib** (format PDF)
- Field `namaJabatan` harus salah satu dari enum:
  - `Rektor`, `Wakil Rektor`, `Ketua Sekolah`, `Pembantu Ketua Sekolah`, `Direktur Akademi`, `Pembantu Direktur`, `Sekretaris Jurusan`
- Body dikirim dalam bentuk `multipart/form-data` dengan field berikut:

```json
{
  "semesterId": 1,
  "kategori": "JABATAN_STRUKTURAL",
  "namaJabatan": "Rektor",
  "prodiId": 1,
  "fakultasId": 1,
  "afiliasi": "Universitas Muhammadiyah Ponorogo"
}
```

**Response (201 - Created)**:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 41,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "JABATAN_STRUKTURAL",
    "nilaiPak": 6,
    "filePath": "pendidikan/fa3fff6a-05bb-4f86-ae6b-59aa503ffcd0.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:37:29.458Z",
    "updatedAt": "2025-08-15T01:37:29.458Z",
    "jabatanStruktural": {
      "id": 1,
      "pelaksanaanId": 41,
      "namaJabatan": "Rektor",
      "prodiId": 1,
      "fakultasId": 1,
      "afiliasi": "Universitas Muhammadiyah Ponorogo"
    }
  }
}
```

### Endpoint Update

```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **opsional** (format PDF)
- Field `namaJabatan` harus salah satu dari enum:
  - `Rektor`, `Wakil Rektor`, `Ketua Sekolah`, `Pembantu Ketua Sekolah`, `Direktur Akademi`, `Pembantu Direktur`, `Sekretaris Jurusan`

```json
{
  "semesterId": 14,
  "kategori": "JABATAN_STRUKTURAL",
  "namaJabatan": "Wakil Rektor",
  "prodiId": 1,
  "fakultasId": 1,
  "afiliasi": "Universitas Muhammadiyah Ponorogo"
}
```

**Response (200 - OK)**:

```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 41,
    "dosenId": 5,
    "semesterId": 14,
    "kategori": "JABATAN_STRUKTURAL",
    "nilaiPak": 5,
    "filePath": "pendidikan/fa3fff6a-05bb-4f86-ae6b-59aa503ffcd0.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:37:29.458Z",
    "updatedAt": "2025-08-15T01:39:57.397Z",
    "jabatanStruktural": {
      "id": 1,
      "pelaksanaanId": 41,
      "namaJabatan": "Wakil Rektor",
      "prodiId": 1,
      "fakultasId": 1,
      "afiliasi": "Universitas Muhammadiyah Ponorogo"
    }
  }
}
```

## Pelaksanaan Pendidikan - BIMBING_DOSEN

### Endpoint Create

```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **wajib** (format PDF)
- Field `jenisBimbingan` harus salah satu dari enum:
  - `REGULER`, `PENCAKOKAN`
- Field `jabatan` harus salah satu dari enum:
  - `ASISTEN_AHLI`, `LEKTOR`, `LEKTOR_KEPALA`, `GURU_BESAR`

```json
{
  "semesterId": 1,
  "kategori": "BIMBING_DOSEN",
  "prodiId": 1,
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-15",
  "jenisBimbingan": "REGULER",
  "jabatan": "LEKTOR",
  "bidangAhli": "Teknologi Pendidikan",
  "deskripsi": "Bimbingan rutin dosen dalam pengembangan kurikulum digital",
  "jumlahDsn": 3
}
```

**Response (201 - Created)**:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 42,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "BIMBING_DOSEN",
    "nilaiPak": 1,
    "filePath": "pendidikan/f0674a64-7c1c-41d7-91f3-8fa358be8e10.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:53:28.723Z",
    "updatedAt": "2025-08-15T01:53:28.723Z",
    "bimbingDosen": {
      "id": 1,
      "pelaksanaanId": 42,
      "prodiId": 1,
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-15T00:00:00.000Z",
      "jenisBimbingan": "REGULER",
      "jabatan": "LEKTOR",
      "bidangAhli": "Teknologi Pendidikan",
      "deskripsi": "Bimbingan rutin dosen dalam pengembangan kurikulum digital",
      "jumlahDsn": 3
    }
  }
}
```

### Endpoint Update

```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **opsional** (format PDF)
- Field `jenisBimbingan` harus salah satu dari enum:
  - `REGULER`, `PENCAKOKAN`
- Field `jabatan` harus salah satu dari enum:
  - `ASISTEN_AHLI`, `LEKTOR`, `LEKTOR_KEPALA`, `GURU_BESAR`

```json
{
  "semesterId": 1,
  "kategori": "BIMBING_DOSEN",
  "prodiId": 1,
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-15",
  "jenisBimbingan": "REGULER",
  "jabatan": "LEKTOR",
  "bidangAhli": "Teknologi Masa Depan",
  "deskripsi": "Bimbingan rutin dosen dalam pengembangan kurikulum digital",
  "jumlahDsn": 5
}
```

**Response (200 - OK)**:

```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 42,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "BIMBING_DOSEN",
    "nilaiPak": 1,
    "filePath": "pendidikan/f0674a64-7c1c-41d7-91f3-8fa358be8e10.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:53:28.723Z",
    "updatedAt": "2025-08-15T01:55:29.753Z",
    "bimbingDosen": {
      "id": 1,
      "pelaksanaanId": 42,
      "prodiId": 1,
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-15T00:00:00.000Z",
      "jenisBimbingan": "REGULER",
      "jabatan": "LEKTOR",
      "bidangAhli": "Teknologi Masa Depan",
      "deskripsi": "Bimbingan rutin dosen dalam pengembangan kurikulum digital",
      "jumlahDsn": 5
    }
  }
}
```

## Pelaksanaan Pendidikan - DATA_SERING_PENCAKOKAN

### Endpoint Create

```
POST {{host}}:{{port}}/pelaksanaan-pendidikan Authorization: Bearer  Content-Type: multipart/form-data

```

**Catatan**:

- `file` **wajib** (format PDF)
- Field `jenis` harus salah satu dari enum:
  - `DATASERING`, `PENCAKOKAN`

```json
{
  "semesterId": 1,
  "kategori": "DATA_SERING_PENCAKOKAN",
  "perguruanTinggi": "Universitas Teknologi Indonesia",
  "jenis": "PENCAKOKAN",
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-15",
  "bidangAhli": "Teknologi Pendidikan"
}
````

**Response (201 - Created)**:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 43,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "DATA_SERING_PENCAKOKAN",
    "nilaiPak": 4,
    "filePath": "pendidikan/756c1ede-660d-48c9-95dd-d47d77bc692f.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:57:58.553Z",
    "updatedAt": "2025-08-15T01:57:58.553Z",
    "dataseringPencakokan": {
      "id": 1,
      "pelaksanaanId": 43,
      "perguruanTinggi": "Universitas Teknologi Indonesia",
      "jenis": "PENCAKOKAN",
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-15T00:00:00.000Z",
      "bidangAhli": "Teknologi Pendidikan"
    }
  }
}
```

### Endpoint Update

```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **opsional** (format PDF)
- Field `jenis` harus salah satu dari enum:
  - `DATASERING`, `PENCAKOKAN`

```json
{
  "semesterId": 1,
  "kategori": "DATA_SERING_PENCAKOKAN",
  "perguruanTinggi": "Universitas Teknologi Indonesia",
  "jenis": "DATASERING",
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-15",
  "bidangAhli": "Teknologi Pendidikan"
}
```

**Response (200 - OK)**:

```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 43,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "DATA_SERING_PENCAKOKAN",
    "nilaiPak": 4,
    "filePath": "pendidikan/756c1ede-660d-48c9-95dd-d47d77bc692f.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T01:57:58.553Z",
    "updatedAt": "2025-08-15T02:00:17.625Z",
    "dataseringPencakokan": {
      "id": 1,
      "pelaksanaanId": 43,
      "perguruanTinggi": "Universitas Teknologi Indonesia",
      "jenis": "DATASERING",
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-15T00:00:00.000Z",
      "bidangAhli": "Teknologi Pendidikan"
    }
  }
}

```
## Pelaksanaan Pendidikan - PENGEMBANGAN\_DIRI

### Endpoint Create

```
POST {{host}}:{{port}}/pelaksanaan-pendidikan
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **wajib** (format PDF)

```json
{
  "semesterId": 1,
  "kategori": "PENGEMBANGAN_DIRI",
  "namaKegiatan": "Workshop Inovasi Pendidikan Digital",
  "deskripsi": "Pelatihan intensif mengenai implementasi teknologi digital dalam pendidikan.",
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-03",
  "penyelenggara": "Universitas Muhammadiyah Indonesia",
  "tempat": "Gedung A, Universitas Muhammadiyah Indonesia",
  "lamaJam": 12,
  "prodiId": 1,
  "fakultasId": 1
}
```

**Response (201 - Created)**:

```json
{
  "success": true,
  "message": "Data berhasil ditambahkan",
  "data": {
    "id": 44,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "PENGEMBANGAN_DIRI",
    "nilaiPak": 0.5,
    "filePath": "pendidikan/da0384ee-931e-4197-b0ba-c56b7581538c.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T02:05:50.072Z",
    "updatedAt": "2025-08-15T02:05:50.072Z",
    "pengembanganDiri": {
      "id": 1,
      "pelaksanaanId": 44,
      "namaKegiatan": "Workshop Inovasi Pendidikan Digital",
      "deskripsi": "Pelatihan intensif mengenai implementasi teknologi digital dalam pendidikan.",
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-03T00:00:00.000Z",
      "penyelenggara": "Universitas Muhammadiyah Indonesia",
      "tempat": "Gedung A, Universitas Muhammadiyah Indonesia",
      "lamaJam": 12,
      "prodiId": 1,
      "fakultasId": 1
    }
  }
}
```

### Endpoint Update

```
PATCH {{host}}:{{port}}/pelaksanaan-pendidikan/:pelaksanaanId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Catatan**:

- `file` **opsional** (format PDF)

```json
{
  "semesterId": 1,
  "kategori": "PENGEMBANGAN_DIRI",
  "namaKegiatan": "Workshop Mikrotik",
  "deskripsi": "Pelatihan intensif mengenai implementasi Mikrotik.",
  "tglMulai": "2025-08-01",
  "tglSelesai": "2025-08-03",
  "penyelenggara": "Universitas Muhammadiyah Indonesia",
  "tempat": "Gedung A, Universitas Muhammadiyah Indonesia",
  "lamaJam": 12,
  "prodiId": 1,
  "fakultasId": 1
}
```

**Response (200 - OK)**:

```json
{
  "success": true,
  "message": "Data berhasil diperbarui",
  "data": {
    "id": 44,
    "dosenId": 5,
    "semesterId": 1,
    "kategori": "PENGEMBANGAN_DIRI",
    "nilaiPak": 0.5,
    "filePath": "pendidikan/da0384ee-931e-4197-b0ba-c56b7581538c.pdf",
    "statusValidasi": "PENDING",
    "catatan": null,
    "createdAt": "2025-08-15T02:05:50.072Z",
    "updatedAt": "2025-08-15T02:08:52.775Z",
    "pengembanganDiri": {
      "id": 1,
      "pelaksanaanId": 44,
      "namaKegiatan": "Workshop Mikrotik",
      "deskripsi": "Pelatihan intensif mengenai implementasi Mikrotik.",
      "tglMulai": "2025-08-01T00:00:00.000Z",
      "tglSelesai": "2025-08-03T00:00:00.000Z",
      "penyelenggara": "Universitas Muhammadiyah Indonesia",
      "tempat": "Gedung A, Universitas Muhammadiyah Indonesia",
      "lamaJam": 12,
      "prodiId": 1,
      "fakultasId": 1
    }
  }
}

```
