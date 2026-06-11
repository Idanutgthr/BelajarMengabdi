import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function InformationPage() {
  const router = useRouter();
  const [photoZoomed, setPhotoZoomed] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>About Us - Belajar Mengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          {/* Kolom pertama: top nav + scrollable content */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Top Nav */}
            <div className="top-bar-nav">
              <button onClick={() => router.push("/dashboard")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">ABOUT US</h2>
              <div style={{ width: "40px" }}></div>
            </div>

            {/* Scrollable content */}
            <div className="content-scroll-area" style={{ padding: "12px 4px 12px 0" }}>

              {/* Hero Text */}
              <p style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-primary, #5e4528)", textAlign: "justify", marginBottom: "16px" }}>
                Selamat datang di <strong>Belajar Mengabdi</strong>, platform belajar digital yang dibuat khusus buat menemani perjuangan kalian yang ingin masuk Kepolisian Republik Indonesia. Di sini, kita bakal bareng-bareng mempersiapkan diri biar jadi calon anggota Polri yang cerdas, tangguh, dan berintegritas!
              </p>

              {/* Cerita */}
              <div className="info-card" style={{ marginBottom: "12px" }}>
                <h3 className="info-card-title" style={{ color: "var(--bg-input, #f6eddf)", marginBottom: "10px" }}>
                  Cerita di Balik Belajar Mengabdi
                </h3>
                <p style={{ fontSize: "12px", lineHeight: "1.8", color: "rgba(255,255,255,0.92)", textAlign: "justify" }}>
                  Halo, semuanya! Kenalkan, aku <strong>Wildan Saputra Wibowo</strong>. Aku adalah mahasiswa Informatika di Universitas Sebelas Maret (UNS) sekaligus developer yang membangun platform ini. Sebagai mahasiswa yang setiap hari bergelut di dunia teknologi, aku berpikir: <em>&quot;Gimana ya caranya biar ilmu yang aku dapat di kampus bisa berguna langsung dan membantu banyak orang?&quot;</em>
                </p>
                <p style={{ fontSize: "12px", lineHeight: "1.8", color: "rgba(255,255,255,0.92)", textAlign: "justify", marginTop: "10px" }}>
                  Nah, pas aku melihat semangat teman-teman yang luar biasa buat ikut seleksi kepolisian, langsung muncul ide buat bikin Belajar Mengabdi. Aku paham banget kalau persiapan tes Polri itu butuh strategi yang matang dan konsisten. Makanya, lewat keahlian pembuatan website yang aku punya, aku rancang platform ini jadi tempat belajar interaktif yang nyaman, lengkap dengan materi esensial, latihan soal, sampai simulasi tryout yang disesuaikan dengan ujian aslinya.
                </p>
              </div>

              {/* Misi */}
              <div className="info-card" style={{ marginBottom: "12px", background: "var(--bg-button-active, #86633b)" }}>
                <h3 className="info-card-title" style={{ color: "var(--bg-input, #f6eddf)", marginBottom: "10px" }}>
                  Misi Kita
                </h3>
                <p style={{ fontSize: "12px", lineHeight: "1.8", color: "rgba(255,255,255,0.92)", textAlign: "justify" }}>
                  Aku percaya kalau persiapan yang matang dan terarah adalah kunci utama buat lolos. Dengan menggabungkan teknologi yang simpel tapi efektif beserta materi yang pas, Belajar Mengabdi hadir buat jadi teman seperjuangan kalian dari awal mulai belajar sampai hari H ujian nanti.
                </p>
                <p style={{ fontSize: "12px", lineHeight: "1.8", color: "rgba(255,255,255,0.92)", marginTop: "10px", fontWeight: "700", textAlign: "center" }}>
                  Yuk, siapkan mental dan energi kalian. Mari berjuang bareng demi seragam kebanggaan!
                </p>
              </div>

              {/* About Developer */}
              <div className="info-card" style={{ textAlign: "center", marginBottom: "4px" }}>
                <h3 className="info-card-title" style={{ color: "var(--bg-input, #f6eddf)", marginBottom: "14px" }}>
                  About Developer
                </h3>

                {/* Foto — klik untuk zoom */}
                <div
                  onClick={() => setPhotoZoomed(true)}
                  style={{ display: "flex", justifyContent: "center", marginBottom: "12px", cursor: "pointer" }}
                  title="Klik untuk memperbesar"
                >
                  <Image
                    src="/MyPhoto.png"
                    alt="Wildan Saputra Wibowo"
                    width={100}
                    height={100}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      display: "block"
                    }}
                  />
                </div>

                <p style={{ fontSize: "14px", fontWeight: "800", color: "white", marginBottom: "14px" }}>
                  Wildan Saputra Wibowo
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a
                    href="https://www.instagram.com/idan.nv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      textDecoration: "none"
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>

                  <a
                    href="https://www.linkedin.com/in/wildan-saputra-wibowo-72b678200/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: "#0077b5",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      textDecoration: "none"
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Fixed bottom button */}
          <div className="bottom-action-btn">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-secondary"
              style={{ padding: "14px" }}
            >
              Kembali Ke Dasbor
            </button>
          </div>
        </div>
      </div>

      {/* Photo zoom modal */}
      {photoZoomed && (
        <div
          onClick={() => setPhotoZoomed(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out"
          }}
        >
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <Image
              src="/MyPhoto.png"
              alt="Wildan Saputra Wibowo"
              width={320}
              height={320}
              style={{ borderRadius: "16px", objectFit: "cover", display: "block", maxWidth: "85vw", maxHeight: "80vh" }}
            />
            <button
              onClick={() => setPhotoZoomed(false)}
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                background: "white",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >✕</button>
          </div>
        </div>
      )}
    </>
  );
}
