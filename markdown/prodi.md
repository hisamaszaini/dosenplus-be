## 🧑‍🎓 Program Studi (Prodi)

---

### 🟢 Create Prodi

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/prodi`  
**Authorization:** Bearer token  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "kode": "TI",
  "nama": "Teknik Informatika",
  "fakultasId": 1
}
```

#### 📥 Contoh Respons (Sukses)
```json
{
  "success": true,
  "message": "Program studi berhasil dibuat",
  "data": {
    "id": 1,
    "kode": "TI",
    "nama": "Teknik Informatika",
    "fakultasId": 1,
    "createdAt": "2025-08-03T10:17:26.184Z",
    "updateAt": "2025-08-03T10:17:26.184Z"
  }
}
```

#### ❌ Contoh Respons (Gagal - duplikat)
```json
{
  "success": false,
  "message": {
    "kode": "Kode prodi sudah digunakan",
    "nama": "Nama prodi sudah digunakan"
  },
  "data": null
}
```

---

### 📚 Get All Prodi

**Method:** `GET`  
**URL:**  
`http://127.0.0.1:3000/prodi?page=1&limit=10&search=&fakultasId=1&sortBy=nama&sortOrder=asc`  
**Authorization:** Bearer token

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Data program studi berhasil diambil",
  "data": [
    {
      "id": 2,
      "kode": "TE",
      "nama": "Teknik Elektro",
      "fakultasId": 1,
      "createdAt": "2025-08-03T10:18:46.248Z",
      "updateAt": "2025-08-03T10:18:46.248Z",
      "fakultas": {
        "id": 1,
        "kode": "FT",
        "nama": "Fakultas Teknik",
        "createdAt": "2025-08-03T09:51:29.682Z",
        "updateAt": "2025-08-03T09:51:29.682Z"
      }
    },
    {
      "id": 1,
      "kode": "TI",
      "nama": "Teknik Informatika",
      "fakultasId": 1,
      "createdAt": "2025-08-03T10:17:26.184Z",
      "updateAt": "2025-08-03T10:17:26.184Z",
      "fakultas": {
        "id": 1,
        "kode": "FT",
        "nama": "Fakultas Teknik",
        "createdAt": "2025-08-03T09:51:29.682Z",
        "updateAt": "2025-08-03T09:51:29.682Z"
      }
    },
    {
      "id": 3,
      "kode": "TM",
      "nama": "Teknik Mesin",
      "fakultasId": 1,
      "createdAt": "2025-08-03T10:18:53.406Z",
      "updateAt": "2025-08-03T10:18:53.406Z",
      "fakultas": {
        "id": 1,
        "kode": "FT",
        "nama": "Fakultas Teknik",
        "createdAt": "2025-08-03T09:51:29.682Z",
        "updateAt": "2025-08-03T09:51:29.682Z"
      }
    }
  ],
  "meta": {
    "page": "1",
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 🔍 Get Prodi by ID

**Method:** `GET`  
**URL:** `http://127.0.0.1:3000/prodi/1`  
**Authorization:** Bearer token

#### 📥 Contoh Respons
```json
{
  "success": true,
  "data": {
    "id": 1,
    "kode": "TI",
    "nama": "Teknik Informatika",
    "fakultasId": 1,
    "createdAt": "2025-08-03T10:17:26.184Z",
    "updateAt": "2025-08-03T10:17:26.184Z",
    "fakultas": {
      "id": 1,
      "kode": "FT",
      "nama": "Fakultas Teknik",
      "createdAt": "2025-08-03T09:51:29.682Z",
      "updateAt": "2025-08-03T09:51:29.682Z"
    }
  }
}
```

---

### 🔄 Update Prodi

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/prodi/3`  
**Authorization:** Bearer token  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "kode": "TSM",
  "nama": "Teknik Sastra Mesin",
  "fakultasId": 1
}
```

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Program studi berhasil diperbarui",
  "data": {
    "id": 3,
    "kode": "TSM",
    "nama": "Teknik Sastra Mesin",
    "fakultasId": 1,
    "createdAt": "2025-08-03T10:18:53.406Z",
    "updateAt": "2025-08-03T10:24:17.395Z"
  }
}
```

---

### ❌ Delete Prodi

**Method:** `DELETE`  
**URL:** `http://127.0.0.1:3000/prodi/3`  
**Authorization:** Bearer token

#### 📥 Contoh Respons
- `204 No Content` (tanpa body)

---
