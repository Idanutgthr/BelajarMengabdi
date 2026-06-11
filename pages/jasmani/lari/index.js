import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function LariTest() {
  const router = useRouter();
  const [gender, setGender] = useState("Pria");
  const [distance, setDistance] = useState("");
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
    const d = parseFloat(distance);
    if (isNaN(d) || d < 0) {
      alert("Masukkan jarak lari yang valid!");
      return;
    }

    setLoading(true);

    let calculatedScore = 0;
    if (gender === "Pria") {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((d - 1600) / (3444 - 1600)) * 100)));
    } else {
      calculatedScore = Math.min(100, Math.max(0, Math.round(((d - 1200) / (3095 - 1200)) * 100)));
    }

    setScore(calculatedScore);

    const historyData = {
      category: "Lari 12 Menit",
      gender,
      performance: `${d} meter`,
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
    setDistance("");
    setScore(null);
    setSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Kalkulator Lari 12 Menit - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/jasmani")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title" style={{ fontSize: "14px" }}>LARI (12 MENIT)</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "20px" }}>
              <h1 className="brand-title" style={{ fontSize: "20px" }}>Lari 12 Menit</h1>
              <p className="brand-subtitle" style={{ fontSize: "12px" }}>Uji Daya Tahan Kardiovaskular</p>
            </div>

            <div className="question-box" style={{ minHeight: "auto", fontSize: "12px", lineHeight: "1.4", marginBottom: "20px", color: "var(--color-text-white)" }}>
              <p style={{ fontWeight: "700", marginBottom: "4px" }}>Standar Nilai 100 POLRI:</p>
              <p style={{ marginBottom: "2px" }}>• Pria: 3.444 Meter (0 Nilai: ≤ 1.600m)</p>
              <p style={{ marginBottom: "2px" }}>• Wanita: 3.095 Meter (0 Nilai: ≤ 1.200m)</p>
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
                  <label className="form-label" htmlFor="distance" style={{ color: "var(--color-text-dark)" }}>Jarak Tempuh</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      id="distance"
                      className="input-field"
                      placeholder="Contoh: 2800"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <span className="input-unit">meter</span>
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
                  Skor Lari Anda: {score}
                </h3>
                
                <p style={{ fontSize: "12px", color: "var(--color-text-body)", lineHeight: "1.4", marginBottom: "24px" }}>
                  Skor dihitung berdasarkan standar baku kesamaptaan jasmani kepolisian RI untuk kategori {gender} dengan jarak {distance} meter.
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
