import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function InformationPage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Informasi Seleksi Kepolisian - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame" style={{ height: "850px" }}>
          <div>
            {/* Top Navigation */}
            <div className="top-bar-nav" style={{ marginBottom: "16px" }}>
              <button onClick={() => router.push("/dashboard")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">INFORMATION</h2>
              <div style={{ width: "40px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "20px" }}>
              <h1 className="brand-title" style={{ fontSize: "20px" }}>Informasi Seleksi</h1>
              <p className="brand-subtitle">AKPOL, BINTARA, & TAMTAMA</p>
            </div>

            <div className="info-section">
              {/* AKPOL */}
              <div className="info-card">
                <h3 className="info-card-title" style={{ color: "#8b5a2b" }}>1. AKPOL (Akademi Kepolisian)</h3>
                <p className="info-card-desc" style={{ marginBottom: "8px" }}>
                  Mencetak Perwira Pertama Polri dengan gelar Sarjana Terapan Kepolisian (S.Tr.K.). Masa pendidikan selama 4 tahun di Semarang.
                </p>
                <div style={{ fontSize: "11px", color: "var(--color-primary-light)", fontWeight: "600" }}>
                  • Tinggi Badan: Pria min. 165 cm, Wanita min. 163 cm<br />
                  • Umur: 16 s.d. 21 tahun saat pembukaan pendidikan
                </div>
              </div>

              {/* BINTARA */}
              <div className="info-card">
                <h3 className="info-card-title" style={{ color: "#8b5a2b" }}>2. BINTARA POLRI</h3>
                <p className="info-card-desc" style={{ marginBottom: "8px" }}>
                  Jalur penerimaan terbesar untuk menjadi Brigadir Polisi Dua (Bripda). Memiliki beberapa cabang seperti PTU (Polisi Tugas Umum), Bakomsus (Kompetensi Khusus), dan Rekpro. Masa pendidikan selama 5 bulan.
                </p>
                <div style={{ fontSize: "11px", color: "var(--color-primary-light)", fontWeight: "600" }}>
                  • Tinggi Badan: Pria min. 165 cm, Wanita min. 160 cm<br />
                  • Umur: Lulusan SMA/sederajat min. 17 tahun 7 bulan, maks. 21 tahun
                </div>
              </div>

              {/* TAMTAMA */}
              <div className="info-card">
                <h3 className="info-card-title" style={{ color: "#8b5a2b" }}>3. TAMTAMA POLRI</h3>
                <p className="info-card-desc" style={{ marginBottom: "8px" }}>
                  Penerimaan golongan Tamtama untuk unit Brimob dan Polair dengan pangkat Bhayangkara Dua (Bharada). Masa pendidikan selama 5 bulan.
                </p>
                <div style={{ fontSize: "11px", color: "var(--color-primary-light)", fontWeight: "600" }}>
                  • Tinggi Badan: Khusus Pria min. 165 cm<br />
                  • Umur: Lulusan SMA/sederajat min. 17 tahun 7 bulan, maks. 22 tahun
                </div>
              </div>

              {/* TAHAPAN SELEKSI */}
              <div className="info-card" style={{ background: "var(--bg-secondary)", borderColor: "var(--color-accent)" }}>
                <h3 className="info-card-title">Tahapan Seleksi Utama</h3>
                <ol style={{ fontSize: "12px", paddingLeft: "16px", lineHeight: "1.6", color: "var(--color-primary)" }}>
                  <li>Pemeriksaan Administrasi Awal (Rikmin Awal)</li>
                  <li>Pemeriksaan Kesehatan Tahap I (Rikkes I)</li>
                  <li>Ujian Psikologi CAT Tahap I (Psikotes I)</li>
                  <li>Ujian Akademik CAT (Matematika, B. Indo, B. Inggris, Pengetahuan Umum)</li>
                  <li>Pemeriksaan Kesehatan Tahap II (Rikkes II)</li>
                  <li>Uji Kesamaptaan Jasmani & Anthropometri</li>
                  <li>Penyelidikan Mental Kepribadian (PMK) & Rikmin Akhir</li>
                  <li>Sidang Pantukhir Akhir Kelulusan</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bottom-action-btn" style={{ paddingTop: "16px" }}>
            <button onClick={() => router.push("/dashboard")} className="btn btn-secondary" style={{ padding: "14px" }}>
              Kembali Ke Dasbor
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
