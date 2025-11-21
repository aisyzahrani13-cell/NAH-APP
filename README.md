# NAH Monitoring App

Dashboard monitoring produksi hidroponik NAH dengan autentikasi role-based sederhana. Aplikasi ini kini mendukung Progressive Web App (PWA) sehingga dapat dipasang di perangkat desktop maupun mobile untuk akses yang lebih cepat.

## Cara Menjalankan
1. Hidupkan server statis (contoh: `npx serve .` atau `python -m http.server`).
2. Buka `http://localhost:5000` (atau port sesuai server) di browser modern.
3. Login menggunakan salah satu kredensial demo:
   - Supervisor: `supervisor / supervisor123`
   - Operator: `operator / operator123`
   - Staff: `staff / staff123`
4. Atau buat akun sendiri melalui formulir "Buat Akun Baru" di halaman login, lalu pilih jabatan yang sesuai sebelum masuk.
   
## Instalasi sebagai Aplikasi
1. Buka dashboard di browser yang mendukung PWA (Chrome, Edge, dll.).
2. Klik opsi "Install App" / "Tambahkan ke layar utama" yang muncul di address bar atau menu browser.
3. Setelah terpasang, aplikasi dapat dijalankan seperti aplikasi native dan mendukung mode offline dasar berkat service worker.

## Penggunaan di Smartphone
- Tampilan login, dashboard, dan tabel sudah dioptimalkan untuk layar sentuh dan akan merapat secara otomatis di layar kecil.
- Form dan tombol dibikin penuh-lebar di perangkat seluler agar mudah disentuh.
- Kamu bisa menambahkan aplikasi ke home screen agar tampil penuh layar tanpa address bar menggunakan manifest dan service worker bawaan.
