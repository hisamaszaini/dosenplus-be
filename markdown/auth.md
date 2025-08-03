## 🔐 Auth

### 🟢 Login

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/auth/login`  
**Content-Type:** `application/json`

#### 📤 Request Body
```json
{
  "identifier": "admin@hisam.ac.id",
  "password": "admin123"
}
```

#### 📥 Contoh Respons
```json
{
  "success": true,
  "message": "Login berhasil!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDAxNCwiZXhwIjoxNzU0MjE0OTE0fQ.evNd7_9SZQ1KRE1TUTkNXXTGSIbK95NaGjvTQqg_aDo",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDAxNCwiZXhwIjoxNzU0ODE4ODE0fQ.Px1WO493-EWBi5vIBZ-Ast1QMOV-ALUw1RdDW8WTUug"
}
```

#### 🔑 Authorization
Gunakan `accessToken` untuk request yang membutuhkan autentikasi:
```http
Authorization: Bearer <accessToken>
```

---

## 👤 Users

### 🟢 Get Profile

**Method:** `GET`  
**URL:** `http://127.0.0.1:3000/users/profile`  
**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDAxNCwiZXhwIjoxNzU0MjE0OTE0fQ.evNd7_9SZQ1KRE1TUTkNXXTGSIbK95NaGjvTQqg_aDo
```

#### 📥 Contoh Respons
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@hisam.ac.id",
    "username": "admin",
    "name": "Admin Sistem",
    "status": "ACTIVE",
    "fotoPath": null,
    "passwordResetToken": null,
    "passwordResetExpires": null,
    "createdAt": "2025-08-03T09:39:23.000Z",
    "updatedAt": "2025-08-03T09:40:14.575Z",
    "userRoles": [
      {
        "id": 1,
        "userId": 1,
        "roleId": 1,
        "role": {
          "id": 1,
          "name": "ADMIN"
        }
      }
    ],
    "dosen": null,
    "validator": null
  }
}
```

### 🔄 Refresh Token

**Method:** `POST`  
**URL:** `http://127.0.0.1:3000/auth/refresh`  
**Content-Type:** `application/json`  
**Authorization Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDAxNCwiZXhwIjoxNzU0ODE4ODE0fQ.Px1WO493-EWBi5vIBZ-Ast1QMOV-ALUw1RdDW8WTUug
```

#### 📥 Contoh Respons
```json
{
  "success": true,
  "mesaage": "Refresh token berhasil",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDQyMiwiZXhwIjoxNzU0MjE1MzIyfQ.0cQG9AX1UOXqjvjqkrob6QUPgtxGI3KW5cfZc0bNBT4",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJBZG1pbiBTaXN0ZW0iLCJlbWFpbCI6ImFkbWluQGhpc2FtLmFjLmlkIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc1NDIxNDQyMiwiZXhwIjoxNzU0ODE5MjIyfQ.elXv59Oulz4DKtoj_eDxeIbJavCauu_Za9U2QH5VhBc"
}
```

#### 🔁 Catatan
- Endpoint ini digunakan untuk mendapatkan `accessToken` dan `refreshToken` baru jika token sebelumnya sudah kadaluarsa.
- Harus menggunakan `refreshToken` dari hasil login sebelumnya pada header `Authorization`.

