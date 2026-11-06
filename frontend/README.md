# Task Management — Frontend

React + Vite, CSS biasa. Terhubung ke backend Express di `http://localhost:3000`.

## Menjalankan

1. Jalankan backend (di folder `task-management`):
   ```
   node server.js
   ```
2. Di folder frontend ini:
   ```
   npm install
   npm run dev
   ```
3. Buka http://localhost:5173

## Catatan

- Request ke `/api/...` diteruskan oleh proxy Vite ke `http://localhost:3000` (lihat `vite.config.js`),
  sehingga backend tidak perlu CORS. Untuk deployment nanti, hal ini perlu ditinjau ulang.
- Access token disimpan di `localStorage`; respons 401 otomatis mengembalikan ke halaman login.
- Tidak ada Supabase key di frontend.

## Struktur

```
src/
  api.js            semua pemanggilan API + penyimpanan token
  utils.js          format tanggal dan daftar status
  App.jsx           routing sederhana (state) + guard login
  components/       Navbar, TaskForm, CourseForm, ConfirmDialog
  pages/            LoginPage, DashboardPage, TasksPage, CoursesPage
  styles.css        gaya hitam-putih
```
