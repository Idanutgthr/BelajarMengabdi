import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ShuttleRunTest() {
  const router = useRouter();
  const [gender, setGender] = useState("Pria");
  const [seconds, setSeconds] = useState("");
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  const calculateScore = async (e) => {
    e.preventDefault();
    const s = parseFloat(seconds);
    if (isNaN(s) || s < 0) {
      alert("Masukkan waktu tempuh yang valid!");
      return;
    }

    setLoading(true);

    let calculatedScore = 0;
    if (gender === "Pria") {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((24 - s) / (24 - 16.2)) * 100)));
    } else {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((26 - s) / (26 - 17.6)) * 100)));
    }

    setScore(calculatedScore);

    const historyData = {
      category: "Shuttle Run",
      gender,
      performance: `${s} detik`,
      score: calculatedScore,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await addDoc(collection(db, "users", auth.currentUser.uid, "jasmani_history"), historyData);
      } catch (e) {
        console.error("Gagal menyimpan ke Firestore:", e);
      }
    } else {
      const existingHistory = JSON.parse(localStorage.getItem("jasmani_history") || "[]");
      localStorage.setItem("jasmani_history", JSON.stringify([historyData, ...existingHistory]));
    }

    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSeconds("");
    setScore(null);
    setSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Kalkulator Shuttle Run - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/jasmani")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title" style={{ fontSize: "15px" }}>SHUTTLE RUN</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "20px" }}>
              <h1 className="brand-title" style={{ fontSize: "20px" }}>Shuttle Run</h1>
              <p className="brand-subtitle" style={{ fontSize: "12px" }}>Uji Kelincahan & Kecepatan Reaksi</p>
            </div>

            <div className="question-box" style={{ minHeight: "auto", fontSize: "12px", lineHeight: "1.4", marginBottom: "20px", color: "var(--color-text-white)" }}>
              <p style={{ fontWeight: "700", marginBottom: "4px" }}>Standar Nilai 100 POLRI (3 Kali Putaran):</p>
              <p style={{ marginBottom: "2px" }}>• Pria: 16.2 Detik (0 Nilai: ≥ 24.0s)</p>
              <p style={{ marginBottom: "2px" }}>• Wanita: 17.6 Detik (0 Nilai: ≥ 26.0s)</p>
            </div>

            {!submitted ? (
              <form onSubmit={calculateScore}>
                <div className="form-group">
                  <label className="form-label" style={{ color: "var(--color-text-dark)" }}>Jenis Kelamin</label>
                  <div className="gender-selector">
                    <button
                      type="button"
                      className={`gender-btn ${gender === "Pria" ? "selected" : ""}`}
                      onClick={() => setGender("Pria")}
                    >
                      PRIA
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === "Wanita" ? "selected" : ""}`}
                      onClick={() => setGender("Wanita")}
                    >
                      WANITA
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="seconds" style={{ color: "var(--color-text-dark)" }}>Waktu Tempuh</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      step="0.01"
                      id="seconds"
                      className="input-field"
                      placeholder="Contoh: 17.5"
                      value={seconds}
                      onChange={(e) => setSeconds(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <span className="input-unit">detik</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "24px" }} disabled={loading}>
                  {loading ? "Menyimpan..." : "Hitung Skor"}
                </button>
              </form>
            ) : (
              <div className="result-card">
                <div className="score-circle">
                  <span className="score-value">{score}</span>
                  <span className="score-label">SKOR</span>
                </div>

                <h3 style={{ color: "var(--color-text-dark)", marginBottom: "12px" }}>
                  Skor Shuttle Run Anda: {score}
                </h3>
                
                <p style={{ fontSize: "12px", color: "var(--color-text-body)", lineHeight: "1.4", marginBottom: "24px" }}>
                  Skor dihitung berdasarkan standar baku kesamaptaan jasmani kepolisian RI untuk kategori {gender} dengan waktu {seconds} detik (kecepatan berlari angka 8 sebanyak 3 putaran).
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={handleReset} className="btn btn-outline" style={{ flex: 1 }}>
                    Hitung Ulang
                  </button>
                  <button onClick={() => router.push("/jasmani")} className="btn btn-primary" style={{ flex: 1 }}>
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
