const form = document.getElementById('gadai-form');
const hasilSection = document.getElementById('hasil');

// Fungsi format Rupiah
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Fungsi format tanggal
function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Hitung admin berdasarkan kategori
function getAdminFee(kategori, pinjaman) {
  switch (kategori) {

    case 'hp':
        if (pinjaman <= 1000000) return 10000;

  return Math.min(Math.ceil(pinjaman / 1000000) * 10000, 100000);
    case 'laptop':
      return Math.max(
        10000,
        Math.ceil((pinjaman * 0.02) / 1000) * 1000
      );

    case 'proyektor':
      return Math.max(
        10000,
        Math.ceil((pinjaman * 0.03) / 1000) * 1000
      );

    case 'tv-kecil':
      return 25000;

    case 'tv-besar':
    return Math.max(
      25000,
      Math.ceil((pinjaman * 0.05) / 1000) * 1000
    );

    default:
      return 10000;
  }
}

// Nama kategori
function getNamaKategori(kategori) {
  const names = {
    laptop: 'Handphone, Laptop, Iphone ',
    proyektor: 'Proyektor, Video Game, iPad, Macbook, SmartWatch, Tablet, Kamera',
    'tv-kecil': 'LED TV < 550rb',
    'tv-besar': 'LED TV > 550rb',
  };
  return names[kategori] || kategori;
}


// Hitung gadai
function calculateGadai(event) {
  event.preventDefault();

  const kategori = document.querySelector('input[name="kategori"]:checked').value;
  const tanggal = document.getElementById('tanggal').value; 

  const pinjaman = Number(
  document.getElementById("pinjaman").value.replace(/\./g, "") || 0
);
  

  if (!tanggal || pinjaman < 100000) {
    alert('Mohon isi semua field dengan benar');
    return;
  }

  // Perhitungan biaya
  // const tarif = pinjaman * 0.1;
  let tarif = pinjaman * 0.10;

  // Bulatkan ke atas ke kelipatan Rp1.000
  tarif = Math.ceil(tarif / 1000) * 1000;
  const admin = getAdminFee(kategori, pinjaman);
  const asuransi = 10000;
  const totalPotongan = tarif + admin + asuransi;

  // Jumlah yang diterima
  const uangTerima = pinjaman - totalPotongan;

  // Tanggal jatuh tempo
  const transaksiDate = new Date(tanggal + 'T00:00:00');
  const jatuhTempo = new Date(transaksiDate);
  jatuhTempo.setDate(jatuhTempo.getDate() + 31);   


  // Skenario pembayaran
  const diskonTebusCepat = Math.ceil((pinjaman - (tarif * 0.5)) / 1000) * 1000;

  // Admin perpanjangan
  const adminPerpanjang =
  pinjaman < 500000
    ? 5000
    : Math.ceil((pinjaman * 0.01) / 1000) * 1000;

  // Perpanjangan
  const perpanjangNormal = Math.ceil(
    (pinjaman * 0.10 + adminPerpanjang) / 1000
  ) * 1000;

  const perpanjangLewat = Math.ceil(
    (pinjaman * 0.15 + adminPerpanjang) / 1000
  ) * 1000; 

    const tebuLewat = Math.ceil(
    (pinjaman + pinjaman * 0.05 + tarif * 0.5) / 1000
  ) * 1000;

  const nominalPengganti = Math.ceil(
    (pinjaman + pinjaman * 0.1) / 1000
  ) * 1000;

  // Update tampilan
  document.getElementById('nominal-pinjaman').textContent = formatRupiah(pinjaman);
  document.getElementById('kategori-display').textContent = getNamaKategori(kategori);
  document.getElementById('tgl-transaksi').textContent = formatDate(tanggal);
  document.getElementById('tgl-jatuh-tempo').textContent = formatDate(
    jatuhTempo.toISOString().split('T')[0]
  );

  document.getElementById('biaya-tarif').textContent = formatRupiah(tarif);
  document.getElementById('biaya-admin').textContent = formatRupiah(admin);
  document.getElementById('biaya-asuransi').textContent = formatRupiah(asuransi);
  document.getElementById('total-potongan').textContent = formatRupiah(totalPotongan);
  document.getElementById('uang-terima').textContent = formatRupiah(uangTerima);

  // Generate scenario cards — dibuat lebih mudah dibaca saat CS menjelaskan ke nasabah
  const scenarioHTML = `
    <div class="scenario-card diskon">
      <div class="recommended">⭐ Pilihan Menguntungkan</div>
      <div class="scenario-left">
        <h4>⚡ Tebus Cepat</h4>
        <p>Tebus Maksimal 3 hari dari Tanggal Transaksi dengan Diskon 50% Tarif Sewa.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 4 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Total Tebus cepat</span>
        <div class="nominal">${formatRupiah(diskonTebusCepat)}</div>
      </div>
    </div>

    <div class="scenario-card perpanjang">
      <div class="scenario-left">
        <h4>📅 Perpanjangan Normal</h4>
        <p>Perpanjang masa pinjaman sampai 30 hari.</p>
      </div>
      <div class="scenario-right">
        <span class="label">Biaya Perpanjangan</span>
        <div class="nominal">${formatRupiah(perpanjangNormal)}</div>
      </div>
    </div>

    <div class="scenario-card lewat">
      <div class="scenario-left">
        <h4>⚠️ Perpanjang Setelah Jatuh Tempo</h4>
        <p>Perpanjangan 1–15 hari setelah jatuh tempo dengan denda flat 5%.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Biaya Perpanjangan</span>
        <div class="nominal">${formatRupiah(perpanjangLewat)}</div>
      </div>
    </div>

    <div class="scenario-card lewat">
      <div class="scenario-left">
        <h4>⚠️ Tebus Setelah Jatuh Tempo</h4>
        <p>Pelunasan 2–15 hari setelah jatuh tempo dengan denda flat 5% + Biaya dibulan berikutnya 5%.</p>
        <div class="scenario-date">Batas: ${formatDate(new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0])}</div>
      </div>
      <div class="scenario-right">
        <span class="label">Total Tebus</span>
        <div class="nominal">${formatRupiah(tebuLewat)}</div>
      </div>
    </div>

    <div class="scenario-card pengganti">
      <div class="scenario-left">
        <h4>🏷️ Asuransi</h4>
        <p>Nominal Asuransi sebesar pinjaman + 10%.</p>
      </div>  
      <div class="scenario-right">
        <span class="label">Nominal Asuransi</span>
        <div class="nominal">${formatRupiah(nominalPengganti)}</div>
      </div>
    </div>
  `;

  document.getElementById('scenario-cards').innerHTML = scenarioHTML;
  hasilSection.style.display = 'block';

  // Scroll ke hasil
  setTimeout(() => {
    hasilSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Event listeners
form.addEventListener('submit', calculateGadai);

 // Format input pinjaman saat diketik
const pinjamanInput = document.getElementById("pinjaman");

pinjamanInput.addEventListener("input", function () {
  let angka = this.value.replace(/\D/g, "");

  this.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
});

// Tab navigation
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    // Update active button
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.add('hidden');
    });
    document.getElementById(tabName).classList.remove('hidden');
  });
});

// Update input text saat number berubah
document.getElementById('pinjaman').addEventListener('change', (e) => {
  const value = e.target.value;
  const pinjamanText = document.getElementById('pinjaman-text');
  if (pinjamanText) {
    pinjamanText.value = value ? formatRupiah(Number(value)).replace('Rp', '').trim() : '';
  }
});

function updateTanggal() {
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  document.getElementById("tanggal").value = today;
}

updateTanggal();

function jadwalkanUpdateTengahMalam() {
  const now = new Date();

  const besok = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 1 // jam 00:00:01
  );

  const delay = besok - now;

  setTimeout(() => {
    updateTanggal();
    jadwalkanUpdateTengahMalam();
  }, delay);
}

jadwalkanUpdateTengahMalam();


const tbody = document.getElementById("tabel-pinjaman");

for (let pinjaman = 500000; pinjaman <= 10000000; pinjaman += 100000) {
  const tarif = pinjaman * 0.10;

  let admin;
  if (pinjaman <= 1000000) {
    admin = 10000;
  } else {
    admin = Math.ceil(pinjaman / 1000000) * 10000;
  }

  const asuransi = 10000;
  const bersih = pinjaman - tarif - admin - asuransi;

  tbody.innerHTML += `
    <tr>
      <td>${formatRupiah(pinjaman)}</td>
      <td>${formatRupiah(bersih)}</td>
    </tr>
  `;
}

