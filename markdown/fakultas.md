## 🏛️ Fakultas

---

### 🟢 Create Fakultas

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/fakultas`  
**Authorization:** Bearer token  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "kode": "FT",
  "nama": "Fakultas Teknik"
}
```

#### 📥 Contoh Respons (Sukses)
```json
{
  "success": true,
  "message": "Fakultas berhasil dibuat",
  "data": {
    "id": 1,
    "kode": "FT",
    "nama": "Fakultas Teknik",
    "createdAt": "2025-08-03T09:51:29.682Z",
    "updateAt": "2025-08-03T09:51:29.682Z"
  }
}
```

#### ❌ Contoh Respons (Gagal - kode duplikat)
```json
{
  "kode": "FT",
  "nama": "Fakultas Hukum"
}
```
```json
{
  "success": false,
  "message": {
    "kode": "Kode fakultas sudah digunakan"
  },
  "data": null
}
```

---

### 🔄 Update Fakultas

**Method:** `PUT`  
**URL:** `http://127.0.0.1:3000/fakultas/2`  
**Authorization:** Bearer token  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "kode": "FH",
  "nama": "Fakultas Hukum"
}
```

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Fakultas berhasil diperbarui",
  "data": {
    "id": 2,
    "kode": "FH",
    "nama": "Fakultas Hukum",
    "createdAt": "2025-08-03T09:52:38.952Z",
    "updateAt": "2025-08-03T09:54:38.089Z"
  }
}
```

---

### 📚 Get All Fakultas

**Method:** `GET`  
**URL:**  
`http://127.0.0.1:3000/fakultas?search=teknik&sortBy=nama&sortOrder=asc`

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Data fakultas berhasil diambil",
  "data": [
    {
      "id": 2,
      "kode": "FH",
      "nama": "Fakultas Hukum",
      "createdAt": "2025-08-03T09:52:38.952Z",
      "updateAt": "2025-08-03T09:54:38.089Z"
    },
    {
      "id": 1,
      "kode": "FT",
      "nama": "Fakultas Teknik",
      "createdAt": "2025-08-03T09:51:29.682Z",
      "updateAt": "2025-08-03T09:51:29.682Z"
    }
  ]
}
```

---

### 🔍 Get Fakultas by ID

**Method:** `GET`  
**URL:** `http://127.0.0.1:3000/fakultas/1`  
**Authorization:** Bearer token

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Data fakultas ditemukan",
  "data": {
    "id": 1,
    "kode": "FT",
    "nama": "Fakultas Teknik",
    "createdAt": "2025-08-03T09:51:29.682Z",
    "updateAt": "2025-08-03T09:51:29.682Z"
  }
}
```

---

### ❌ Delete Fakultas

**Method:** `DELETE`  
**URL:** `http://127.0.0.1:3000/fakultas/2`  
**Authorization:** Bearer token

#### 📥 Contoh Respons
- `204 No Content` (tidak ada body dikembalikan)

---

