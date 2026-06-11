import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function PushUpTest() {
  const router = useRouter();
  const [gender, setGender] = useState("Pria");
  const [reps, setReps] = useState("");
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
    const r = parseInt(reps);
    if (isNaN(r) || r < 0) {
      alert("Masukkan jumlah pengulangan yang valid!");
      return;
    }

    setLoading(true);

    let calculatedScore = 0;
    if (gender === "Pria") {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((r - 10) / (43 - 10)) * 100)));
    } else {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((r - 6) / (37 - 6)) * 100)));
    }

    setScore(calculatedScore);

    const historyData = {
      category: "Push Up",
      gender,
      performance: `${r} kali`,
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
    setReps("");
    setScore(null);
    setSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Kalkulator Push Up - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/jasmani")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title" style={{ fontSize: "14px" }}>PUSH UP (1 MENIT)</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "20px" }}>
              <h1 className="brand-title" style={{ fontSize: "20px" }}>Push Up</h1>
              <p className="brand-subtitle" style={{ fontSize: "12px" }}>Uji Kekuatan Otot Dada & Lengan</p>
            </div>

            <div className="question-box" style={{ minHeight: "auto", fontSize: "12px", lineHeight: "1.4", marginBottom: "20px", color: "var(--color-text-white)" }}>
              <p style={{ fontWeight: "700", marginBottom: "4px" }}>Standar Nilai 100 POLRI (1 Menit):</p>
              <p style={{ marginBottom: "2px" }}>• Pria: 43 Kali (0 Nilai: ≤ 10 kali)</p>
              <p style={{ marginBottom: "2px" }}>• Wanita: 37 Kali (0 Nilai: ≤ 6 kali)</p>
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
                  <label className="form-label" htmlFor="reps" style={{ color: "var(--color-text-dark)" }}>Jumlah Pengulangan</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      id="reps"
                      className="input-field"
                      placeholder="Contoh: 35"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <span className="input-unit">kali</span>
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
                  Skor Push Up Anda: {score}
                </h3>
                
                <p style={{ fontSize: "12px", color: "var(--color-text-body)", lineHeight: "1.4", marginBottom: "24px" }}>
                  Skor dihitung berdasarkan standar baku kesamaptaan jasmani kepolisian RI untuk kategori {gender} dengan jumlah {reps} kali pengulangan dalam 1 menit.
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
