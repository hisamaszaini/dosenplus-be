## 📘 Semester API

### 🔹 Create Semester

**Endpoint:**  
`POST http://127.0.0.1:3000/semester`

**Headers:**
- Authorization: Bearer `<token>`
- Content-Type: application/json

**Request Body:**
```json
{
  "tipe": "GANJIL",
  "tahunMulai": 2024,
  "tahunSelesai": 2025,
  "status": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Semester berhasil dibuat",
  "data": {
    "id": 1,
    "kode": 202420250,
    "nama": "Ganjil 2024/2025",
    "tipe": "GANJIL",
    "tahunMulai": 2024,
    "tahunSelesai": 2025,
    "status": true,
    "createdAt": "2025-08-04T11:59:05.128Z",
    "updateAt": "2025-08-04T11:59:05.128Z"
  }
}
```

---

### 🔹 Update Semester

**Endpoint:**  
`PATCH http://127.0.0.1:3000/semester/:id`  
Contoh: `/semester/1`

**Headers:**
- Authorization: Bearer `<token>`
- Content-Type: application/json

**Request Body:**
```json
{
  "tipe": "GENAP",
  "tahunMulai": 2023,
  "tahunSelesai": 2024,
  "status": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Semester berhasil diperbarui",
  "data": {
    "id": 1,
    "kode": 202320241,
    "nama": "Genap 2023/2024",
    "tipe": "GENAP",
    "tahunMulai": 2023,
    "tahunSelesai": 2024,
    "status": true,
    "createdAt": "2025-08-04T11:59:05.128Z",
    "updateAt": "2025-08-04T12:09:08.027Z"
  }
}
```

### 🔹 Get All Semester

**Endpoint:**  
`GET http://127.0.0.1:3000/semester`

**Headers:**
- Authorization: Bearer `<token>`

**Query Parameters:**
- `page` (number) — Halaman (default: 1)
- `limit` (number) — Jumlah item per halaman (default: 20)
- `search` (string) — Pencarian umum (opsional)
- `tahunMulai` (number) — Filter tahun mulai (opsional)
- `tahunSelesai` (number) — Filter tahun selesai (opsional)
- `tipe` (string) — Filter berdasarkan tipe semester: `GANJIL` atau `GENAP` (opsional)
- `sortBy` (string) — Kolom pengurutan, contoh: `tahunMulai`
- `sortOrder` (string) — Arah pengurutan: `asc` atau `desc`

**Contoh Request:**  
`GET http://127.0.0.1:3000/semester?page=1&limit=20&search=&tahunMulai=&tahunSelesai=&tipe=&sortBy=tahunMulai&sortOrder=desc`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data semester berhasil diambil",
  "data": [
    {
      "id": 2,
      "kode": 202420251,
      "nama": "Genap 2024/2025",
      "tipe": "GENAP",
      "tahunMulai": 2024,
      "tahunSelesai": 2025,
      "status": true,
      "createdAt": "2025-08-04T12:00:03.523Z",
      "updateAt": "2025-08-04T12:00:03.523Z"
    },
    {
      "id": 7,
      "kode": 202420250,
      "nama": "Ganjil 2024/2025",
      "tipe": "GANJIL",
      "tahunMulai": 2024,
      "tahunSelesai": 2025,
      "status": true,
      "createdAt": "2025-08-04T12:13:54.882Z",
      "updateAt": "2025-08-04T12:13:54.882Z"
    },
    {
      "id": 1,
      "kode": 202320241,
      "nama": "Genap 2023/2024",
      "tipe": "GENAP",
      "tahunMulai": 2023,
      "tahunSelesai": 2024,
      "status": true,
      "createdAt": "2025-08-04T11:59:05.128Z",
      "updateAt": "2025-08-04T12:09:08.027Z"
    },
    {
      "id": 11,
      "kode": 202320240,
      "nama": "Ganjil 2023/2024",
      "tipe": "GANJIL",
      "tahunMulai": 2023,
      "tahunSelesai": 2024,
      "status": true,
      "createdAt": "2025-08-04T12:14:27.139Z",
      "updateAt": "2025-08-04T12:14:27.139Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

### 🔹 Get Semester by ID

**Endpoint:**  
`GET http://127.0.0.1:3000/semester/:id`  
Contoh: `/semester/1`

**Headers:**
- Authorization: Bearer `<token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "kode": 202320241,
    "nama": "Genap 2023/2024",
    "tipe": "GENAP",
    "tahunMulai": 2023,
    "tahunSelesai": 2024,
    "status": true,
    "createdAt": "2025-08-04T11:59:05.128Z",
    "updateAt": "2025-08-04T12:09:08.027Z"
  }
}
```

### 🔹 Delete Semester

**Endpoint:**  
`DELETE http://127.0.0.1:3000/semester/:id`  
Contoh: `/semester/20`

**Headers:**
- Authorization: Bearer `<token>`

**Response:**

- **HTTP Status Code:** `204 No Content`
- **Response Body:** *(Tidak ada konten)*

> Data semester berhasil dihapus apabila ID ditemukan. Jika tidak ditemukan, bisa mengembalikan `404 Not Found`.
