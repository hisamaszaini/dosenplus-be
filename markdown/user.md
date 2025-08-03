## 👤 User Management

---

### 🟢 Create User

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/users`  
**Authorization:** Bearer token  
**Content-Type:** `multipart/form-data`  
**Body:**  
- `file` (opsional): JPG, JPEG, PNG  
- `data`: JSON stringified object  

#### 📤 Contoh data
```json
{
  "dataUser": {
    "email": "admin@example.com",
    "username": "admin2",
    "name": "admin 2",
    "password": "password123",
    "confirmPassword": "password123",
    "roles": ["ADMIN"]
  }
}
```

#### 📥 Contoh Respons (Sukses - Admin/Validator/Dosen/MultiRole)
```json
{
  "success": true,
  "message": "User berhasil ditambahkan",
  "userData": {
    "id": 5,
    "email": "multiuser@example.com",
    "username": "multiuser",
    "name": "Multi User",
    "status": "ACTIVE",
    "fotoPath": null,
    "passwordResetToken": null,
    "passwordResetExpires": null,
    "createdAt": "2025-08-03T10:45:04.818Z",
    "updatedAt": "2025-08-03T10:45:04.818Z"
  }
}
```

#### ❌ Contoh Respons (Gagal)
```json
{
  "success": false,
  "message": {
    "email": "Email sudah digunakan.",
    "username": "Username sudah digunakan."
  },
  "data": null
}
```

---

### 🔄 Update User

**Method:** `PUT`  
**URL:** `http://127.0.0.1:3000/users/:id`  
**Authorization:** Bearer token  
**Content-Type:** `multipart/form-data`  
- `file` (opsional)  
- `data`: JSON stringified object  

#### 📤 Contoh data
```json
{
  "dataUser": {
    "email": "admin2@example.com",
    "username": "admin2",
    "name": "Admin Dua",
    "status": "ACTIVE",
    "password": "",
    "confirmPassword": "",
    "roles": ["ADMIN", "DOSEN", "VALIDATOR"]
  },
  "dosenBiodata": {
    "nama": "Admin Dua",
    "nip": "198011112222",
    "nuptk": "2233445566",
    "jenis_kelamin": "Laki-laki",
    "no_hp": "081234567892",
    "prodiId": 1,
    "fakultasId": 1,
    "jabatan": "Lektor Kepala"
  },
  "dataKepegawaian": {
    "npwp": "123456789012346",
    "nama_bank": "BNI",
    "no_rek": "9876543210",
    "bpjs_kesehatan": "2233445566",
    "bpjs_tkerja": "6655443322",
    "no_kk": "1122334455667788"
  },
  "validatorBiodata": {
    "nama": "Admin Dua",
    "nip": "198011112222",
    "jenis_kelamin": "Laki-laki",
    "no_hp": "081234567892"
  }
}
```

#### 📥 Contoh Respons (Sukses)
```json
{
  "success": true,
  "message": "User berhasil diperbarui",
  "data": {
    "id": 2,
    "email": "admin2@example.com",
    "username": "admin2",
    "name": "Admin Dua",
    "status": "ACTIVE",
    "fotoPath": null,
    "createdAt": "2025-08-03T10:42:28.374Z",
    "updatedAt": "2025-08-03T10:57:12.383Z",
    "userRoles": [
      { "role": { "name": "ADMIN" } },
      { "role": { "name": "DOSEN" } },
      { "role": { "name": "VALIDATOR" } }
    ],
    "dosen": {
      "nama": "Admin Dua",
      "nip": "198011112222",
      "jabatan": "Lektor Kepala"
    },
    "validator": {
      "nama": "Admin Dua",
      "nip": "198011112222"
    }
  }
}
```

---

### 🔒 Update Password Sendiri

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/users/profile/password`  
**Authorization:** Bearer token  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "oldPassword": "password_lama",
  "newPassword": "password_baru123",
  "confirmPassword": "password_baru123"
}
```

#### 📥 Respons (Sukses)
```json
{
  "success": true,
  "message": "Password berhasil diperbarui"
}
```

#### ❌ Respons (Gagal)
```json
{
  "success": false,
  "message": {
    "oldPassword": "Password lama tidak sesuai"
  },
  "data": null
}
```

---

### 🖼️ Update Foto Profil Sendiri

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/users/profile/foto`  
**Authorization:** Bearer token  
**Content-Type:** `multipart/form-data`  
- `file` (required): JPG, JPEG, PNG

#### ❌ Respons Gagal (tanpa file)
```json
{
  "success": false,
  "message": "File is required",
  "data": null
}
```

---
### 👥 Get All Users

**Method:** `GET`  
**URL:** `http://127.0.0.1:3000/users?page=1&limit=20&search=&role=&status=`  
**Authorization:** Bearer token  
**Query Params:**
- `page` — halaman data
- `limit` — jumlah data per halaman
- `search` — pencarian berdasarkan nama/email
- `role` — filter berdasarkan peran (opsional)
- `status` — filter status user (opsional)

#### 📥 Contoh Respons (Sukses)
```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": [
    {
      "id": 5,
      "name": "Multi User",
      "email": "multiuser@example.com",
      "status": "ACTIVE",
      "createdAt": "2025-08-03T10:45:04.818Z",
      "userRoles": [
        { "role": { "name": "ADMIN" } },
        { "role": { "name": "DOSEN" } },
        { "role": { "name": "VALIDATOR" } }
      ]
    },
    {
      "id": 4,
      "name": "Dosen Satu",
      "email": "dosen1@example.com",
      "status": "ACTIVE",
      "createdAt": "2025-08-03T10:44:31.483Z",
      "userRoles": [
        { "role": { "name": "DOSEN" } }
      ]
    },
    {
      "id": 3,
      "name": "Validator Satu",
      "email": "validator1@example.com",
      "status": "ACTIVE",
      "createdAt": "2025-08-03T10:43:59.752Z",
      "userRoles": [
        { "role": { "name": "VALIDATOR" } }
      ]
    },
    {
      "id": 2,
      "name": "Admin Dua",
      "email": "admin2@example.com",
      "status": "ACTIVE",
      "createdAt": "2025-08-03T10:42:28.374Z",
      "userRoles": [
        { "role": { "name": "ADMIN" } },
        { "role": { "name": "DOSEN" } },
        { "role": { "name": "VALIDATOR" } }
      ]
    },
    {
      "id": 1,
      "name": "Admin Sistem",
      "email": "admin@hisam.ac.id",
      "status": "ACTIVE",
      "createdAt": "2025-08-03T09:39:23.000Z",
      "userRoles": [
        { "role": { "name": "ADMIN" } }
      ]
    }
  ],
  "meta": {
    "page": "1",
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### ✏️ Update Data Dosen (Pengajuan)

**Method:** `PUT`  
**URL:** `http://127.0.0.1:3000/users/dosen/update-data`  
**Authorization:** Bearer token (Dosen)

**Request Body:**
```json
{
  "biodata": {
    "nama": "Dosen Baru",
    "nip": "1980111122330002",
    "nuptk": "5566778899",
    "jenis_kelamin": "Laki-laki",
    "no_hp": "081234567899",
    "prodiId": 1,
    "fakultasId": 1,
    "jabatan": "Lektor Kepala"
  },
  "kepegawaian": {
    "npwp": "987654321012345",
    "nama_bank": "BRI",
    "no_rek": "112233445566",
    "bpjs_kesehatan": "112233",
    "bpjs_tkerja": "445566",
    "no_kk": "9988776655443322"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Permintaan update telah dikirim dan menunggu peninjauan."
}
```

---

### ✅ Validasi Biodata Dosen (oleh Admin / Validator)

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/users/dosen/pending/biodata/1`  
**Authorization:** Bearer token (Admin / Validator)

**Request Body:**
```json
{
  "status": "APPROVED",
  "catatan": "Biodata sudah sesuai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Validasi biodata approved"
}
```

---

### ✅ Validasi Data Kepegawaian Dosen (oleh Admin / Validator)

**Method:** `PATCH`  
**URL:** `http://127.0.0.1:3000/users/dosen/pending/kepegawaian/1`  
**Authorization:** Bearer token (Admin / Validator)

**Request Body:**
```json
{
  "status": "APPROVED",
  "catatan": "Data kepegawaian sudah sesuai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Validasi data kepegawaian approved"
}
```

### 🔍 Get User by ID

**Method:** `GET`  
**URL:** `http://127.0.0.1:3000/users/5`  
**Authorization:** Bearer Token (Admin / Validator)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "multiuser@example.com",
    "username": "multiuser",
    "name": "Multi User",
    "status": "ACTIVE",
    "fotoPath": null,
    "passwordResetToken": null,
    "passwordResetExpires": null,
    "createdAt": "2025-08-03T10:45:04.818Z",
    "updatedAt": "2025-08-03T11:21:20.420Z",
    "userRoles": [
      {
        "id": 5,
        "userId": 5,
        "roleId": 1,
        "role": {
          "id": 1,
          "name": "ADMIN"
        }
      },
      {
        "id": 6,
        "userId": 5,
        "roleId": 2,
        "role": {
          "id": 2,
          "name": "DOSEN"
        }
      },
      {
        "id": 7,
        "userId": 5,
        "roleId": 3,
        "role": {
          "id": 3,
          "name": "VALIDATOR"
        }
      }
    ],
    "dosen": {
      "id": 5,
      "nama": "Dosen Baru",
      "nip": "1980111122330002",
      "nuptk": "5566778899",
      "jenis_kelamin": "Laki-laki",
      "no_hp": "081234567897",
      "prodiId": 1,
      "fakultasId": 1,
      "jabatan": "Lektor Kepala",
      "createdAt": "2025-08-03T10:45:04.829Z",
      "updateAt": "2025-08-03T11:56:20.235Z",
      "dataKepegawaian": {
        "id": 5,
        "npwp": "987654321012345",
        "nama_bank": "BRIS",
        "no_rek": "112233445566",
        "bpjs_kesehatan": "112233",
        "bpjs_tkerja": "445566",
        "no_kk": "9988776655443322"
      },
      "fakultas": {
        "id": 1,
        "kode": "FT",
        "nama": "Fakultas Teknik",
        "createdAt": "2025-08-03T09:51:29.682Z",
        "updateAt": "2025-08-03T09:51:29.682Z"
      },
      "prodi": {
        "id": 1,
        "kode": "TI",
        "nama": "Teknik Informatika",
        "fakultasId": 1,
        "createdAt": "2025-08-03T10:17:26.184Z",
        "updateAt": "2025-08-03T10:17:26.184Z"
      },
      "pendidikan": []
    },
    "validator": {
      "id": 5,
      "nama": "Multi User",
      "nip": "197800112233",
      "jenis_kelamin": "Laki-laki",
      "no_hp": "081234567899"
    }
  }
}
```

### 👨‍🏫 Get All Dosen (Admin Only)

**Method:** `GET`  
**URL:** `http://localhost:3000/users/dosen`  
**Query Params:**
- `page`: halaman (default: 1)
- `limit`: batas data per halaman (default: 10)
- `search`: pencarian nama
- `fakultasId`: filter berdasarkan ID fakultas
- `sortBy`: kolom pengurutan (misal: `nama`)
- `sortOrder`: `asc` atau `desc`

**Authorization:** Bearer `<admin_token>`

**Response:**
```json
{
  "success": true,
  "message": "Data dosen berhasil diambil",
  "data": [
    {
      "id": 2,
      "nama": "Admin Dua",
      "nip": "198011112222",
      "nuptk": "2233445566",
      "jabatan": "Lektor Kepala",
      "prodi": "Teknik Informatika",
      "fakultas": "Fakultas Teknik"
    },
    {
      "id": 5,
      "nama": "Dosen Baru",
      "nip": "1980111122330002",
      "nuptk": "5566778899",
      "jabatan": "Lektor Kepala",
      "prodi": "Teknik Informatika",
      "fakultas": "Fakultas Teknik"
    },
    {
      "id": 4,
      "nama": "Dosen Satu",
      "nip": "1978123456",
      "nuptk": "1122334455",
      "jabatan": "Lektor",
      "prodi": "Teknik Informatika",
      "fakultas": "Fakultas Teknik"
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

### ✅ Get All Validator (Admin Only)

**Method:** `GET`  
**URL:** `http://localhost:3000/users/validator`  
**Query Params:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder` (sama seperti dosen)

**Authorization:** Bearer `<admin_token>`

**Response:**
```json
{
  "success": true,
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  },
  "data": [
    {
      "id": 2,
      "nama": "Admin Dua",
      "nip": "198011112222",
      "jenis_kelamin": "Laki-laki",
      "no_hp": "081234567892"
    },
    {
      "id": 5,
      "nama": "Multi User",
      "nip": "197800112233",
      "jenis_kelamin": "Laki-laki",
      "no_hp": "081234567899"
    },
    {
      "id": 3,
      "nama": "Validator Satu",
      "nip": "1987654321",
      "jenis_kelamin": "Perempuan",
      "no_hp": "081234567890"
    }
  ]
}
```

### 🗑️ Delete User by ID
**Akses:** `Admin Only`
**Method:** `DELETE`  
**URL:** `http://127.0.0.1:3000/users/5`  
**Authorization:** Bearer `<admin_token>`

**Response:**  
📄 `204 No Content` – User berhasil dihapus, tidak ada body dikembalikan.