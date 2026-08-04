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

    // case 'laptop':
    //   return Math.ceil((pinjaman * 0.02) / 1000) * 1000;

    // case 'proyektor':
    //   return Math.ceil((pinjaman * 0.03) / 1000) * 1000;

    case 'laptop':
      return Math.max(
        5000,
        Math.ceil((pinjaman * 0.02) / 1000) * 1000
      );

    case 'proyektor':
      return Math.max(
        5000,
        Math.ceil((pinjaman * 0.03) / 1000) * 1000
      );

    case 'tv-kecil':
      return 25000;

    case 'tv-besar':
      return Math.ceil((pinjaman * 0.05) / 1000) * 1000;

    default:
      return 10000;
  }
}

// Nama kategori
function getNamaKategori(kategori) {
  const names = {
    laptop: 'Handphone, Laptop, Iphone, ',
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
  const pinjaman = Number(document.getElementById('pinjaman').value || 0);

  if (!tanggal || pinjaman < 100000) {
    alert('Mohon isi semua field dengan benar');
    return;
  }

  // Perhitungan biaya
  const tarif = pinjaman * 0.1;
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
  // const perpanjangNormal = Math.ceil((pinjaman * 0.11) / 1000) * 1000;
  // const perpanjangNormal = Math.max(
  // 5000,
  // Math.ceil((pinjaman * 0.11) / 1000) * 1000
  // );
  const tarifPerpanjang = pinjaman * 0.10;

  const adminPerpanjang = Math.max(
    5000,
    Math.ceil((pinjaman * 0.01) / 1000) * 1000
  );

  const perpanjangNormal = Math.ceil(
    (tarifPerpanjang + adminPerpanjang) / 1000
  ) * 1000;


  const perpanjangLewat = Math.ceil((pinjaman * 0.16) / 1000) * 1000;
  
  const tebuLewat = pinjaman + pinjaman * 0.05 + tarif * 0.5;
  const nominalPengganti = pinjaman + pinjaman * 0.1;

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

  // Generate scenario cards
  const scenarioHTML = `
    <div class="scenario-card terima">
      <div>
        <h4>↓ Uang Terima Bersih</h4>
        <p>Pinjaman - Tarif - Admin - Asuransi</p>
      </div>
      <div class="nominal">${formatRupiah(uangTerima)}</div>
    </div>

    <div class="scenario-card diskon">
      <div>
        <h4>⚡ Diskon Tebus Cepat</h4>
        <p>Promo Tebus Cepat 0-3 hari setelah transaksi diskon 50%<br><small style="color: #2563eb; font-weight: 600;">Batas: ${formatDate(
          new Date(transaksiDate.getTime() + 4 * 86400000).toISOString().split('T')[0]
        )} (3 hari setelah transaksi)</small></p>
      </div>
      <div class="nominal">${formatRupiah(diskonTebusCepat)}</div>
    </div>

    <div class="scenario-card perpanjang">
      <div>
        <h4>📅 Perpanjangan Normal</h4>
        <p>Perpanjangan untuk menambah waktu jatuh tempo 30 hari </p>
      </div>
      <div class="nominal">${formatRupiah(perpanjangNormal)}</div>
    </div>

    <div class="scenario-card lewat">
      <div>
        <h4>⚠️ Perpanjangan Lewat Jatuh Tempo</h4>
        <p>Perpanjangan lewat dari jatuh tempo 1 sampai 15 hari, denda flat 5% </p>
        <p><small style="color: #eb2525; font-weight: 600;">Batas: ${formatDate(
          new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0]
        )} (Maxsimal Perlanjangan)</small>
        </p>
      </div>
      <div class="nominal">${formatRupiah(perpanjangLewat)}</div>
    </div>

    <div class="scenario-card lewat">
      <div>
        <h4>⊘ Tebus Lewat Jatuh Tempo</h4>
        <p>Pelunasan lewat dari jatuh tempo 2 sampai 15 hari, denda flat 5%</p>
        <p>Biaya bulan selanjutnya 5%<br><small style="color: #eb2525; font-weight: 600;">Batas: ${formatDate(
          new Date(transaksiDate.getTime() + 46 * 86400000).toISOString().split('T')[0]
        )} (Maxsimal Pelunasan)</small>
        </p>
      </div>
      <div class="nominal">${formatRupiah(tebuLewat)}</div>
    </div>

    <div class="scenario-card pengganti">
      <div>
        <h4>🏷️ Nominal Pengganti</h4>
        <p>Pinjaman + 10%</p>
      </div>
      <div class="nominal">${formatRupiah(nominalPengganti)}</div>
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
  document.getElementById('pinjaman-text').value = value
    ? formatRupiah(Number(value)).replace('Rp', '').trim()
    : '';
});

// Set default date
// const today = new Date().toISOString().split('T')[0];
// document.getElementById('tanggal').value = today;



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