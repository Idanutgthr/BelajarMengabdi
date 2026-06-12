import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function KalkulatorJasmaniGabungan() {
  const router = useRouter();
  const [gender, setGender] = useState("Pria");
  
  // Inputs
  const [distance, setDistance] = useState("");
  const [pullupReps, setPullupReps] = useState("");
  const [situpReps, setSitupReps] = useState("");
  const [pushupReps, setPushupReps] = useState("");
  const [shuttleTime, setShuttleTime] = useState("");
  const [renangTime, setRenangTime] = useState("");

  // Results
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({
    lari: 0,
    pullupChinning: 0,
    pushup: 0,
    situp: 0,
    shuttleRun: 0,
    samaptaB: 0,
    samaptaAB: 0,
    renang: 0,
    nilaiAkhir: 0
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  const handleCalculate = async (e) => {
    e.preventDefault();

    const d = parseFloat(distance);
    const pu = parseInt(pullupReps);
    const su = parseInt(situpReps);
    const ph = parseInt(pushupReps);
    const sr = parseFloat(shuttleTime);
    const rn = parseFloat(renangTime);

    if (isNaN(d) || d < 0 || isNaN(pu) || pu < 0 || isNaN(su) || su < 0 || isNaN(ph) || ph < 0 || isNaN(sr) || sr < 0 || isNaN(rn) || rn < 0) {
      alert("Masukkan nilai yang valid dan positif untuk semua item tes!");
      return;
    }

    setLoading(true);

    // 1. Lari 12 Menit
    let scoreLari = 0;
    if (gender === "Pria") {
      scoreLari = Math.min(100, Math.max(0, Math.round(((d - 1600) / (3444 - 1600)) * 100)));
    } else {
      scoreLari = Math.min(100, Math.max(0, Math.round(((d - 1200) / (3095 - 1200)) * 100)));
    }

    // 2. Pull Up / Chinning
    let scorePullupChinning = 0;
    if (gender === "Pria") {
      // Pull Up Pria exact mapping
      const pullUpPriaScores = [0, 4, 8, 14, 20, 26, 32, 39, 46, 52, 58, 64, 70, 76, 82, 88, 94, 100];
      scorePullupChinning = pu >= 17 ? 100 : (pullUpPriaScores[pu] || 0);
    } else {
      // Chinning Wanita formula
      scorePullupChinning = Math.min(100, Math.max(0, Math.round((pu / 72) * 100)));
    }

    // 3. Push Up
    let scorePushup = 0;
    if (gender === "Pria") {
      scorePushup = Math.min(100, Math.max(0, Math.round(((ph - 10) / (43 - 10)) * 100)));
    } else {
      scorePushup = Math.min(100, Math.max(0, Math.round(((ph - 6) / (37 - 6)) * 100)));
    }

    // 4. Sit Up
    let scoreSitup = 0;
    if (gender === "Pria") {
      scoreSitup = Math.min(100, Math.max(0, Math.round(((su - 10) / (40 - 10)) * 100)));
    } else {
      scoreSitup = Math.min(100, Math.max(0, Math.round(((su - 8) / (40 - 8)) * 100)));
    }

    // 5. Shuttle Run
    let scoreShuttle = 0;
    if (gender === "Pria") {
      scoreShuttle = Math.min(100, Math.max(0, Math.round(((24 - sr) / (24 - 16.2)) * 100)));
    } else {
      scoreShuttle = Math.min(100, Math.max(0, Math.round(((26 - sr) / (26 - 17.6)) * 100)));
    }

    // 6. Renang
    let scoreRenang = 0;
    if (gender === "Pria") {
      scoreRenang = Math.min(100, Math.max(0, Math.round(((55 - rn) / (55 - 14)) * 100)));
    } else {
      scoreRenang = Math.min(100, Math.max(0, Math.round(((60 - rn) / (60 - 20)) * 100)));
    }

    // Aggregations
    const scoreSamaptaB = Math.round(((scorePullupChinning + scorePushup + scoreSitup + scoreShuttle) / 4) * 100) / 100;
    const scoreSamaptaAB = Math.round(((scoreLari + scoreSamaptaB) / 2) * 100) / 100;
    const scoreNilaiAkhir = Math.round(((scoreSamaptaAB * 0.8) + (scoreRenang * 0.2)) * 100) / 100;

    const calculatedScores = {
      lari: scoreLari,
      pullupChinning: scorePullupChinning,
      pushup: scorePushup,
      situp: scoreSitup,
      shuttleRun: scoreShuttle,
      samaptaB: scoreSamaptaB,
      samaptaAB: scoreSamaptaAB,
      renang: scoreRenang,
      nilaiAkhir: scoreNilaiAkhir
    };

    setScores(calculatedScores);

    // Save to history
    const historyData = {
      category: "Nilai Gabungan",
      gender,
      performance: `L: ${d}m, PU/CH: ${pu}x, SU: ${su}x, PU: ${ph}x, SR: ${sr}s, R: ${rn}s`,
      score: scoreNilaiAkhir,
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
    setPullupReps("");
    setSitupReps("");
    setPushupReps("");
    setShuttleTime("");
    setRenangTime("");
    setSubmitted(false);
  };

  return (
    <>
      <Head>
        <title>Kalkulator Jasmani Gabungan POLRI - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame" style={{ height: "850px" }}>
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/jasmani")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title" style={{ fontSize: "12px" }}>KALKULATOR GABUNGAN</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "16px" }}>
              <h1 className="brand-title" style={{ fontSize: "18px" }}>Nilai Jasmani Polri</h1>
              <p className="brand-subtitle" style={{ fontSize: "12px" }}>Simulasi Nilai Gabungan Kesamaptaan</p>
            </div>

            <div className="content-scroll-area">
              {!submitted ? (
                <form onSubmit={handleCalculate} style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "20px" }}>
                  <div className="form-group" style={{ marginBottom: "4px" }}>
                    <label className="form-label" style={{ color: "var(--color-text-dark)", fontSize: "12px" }}>Jenis Kelamin</label>
                    <div className="gender-selector">
                      <button
                        type="button"
                        className={`gender-btn ${gender === "Pria" ? "selected" : ""}`}
                        onClick={() => setGender("Pria")}
                        style={{ padding: "8px", fontSize: "12px" }}
                      >
                        PRIA
                      </button>
                      <button
                        type="button"
                        className={`gender-btn ${gender === "Wanita" ? "selected" : ""}`}
                        onClick={() => setGender("Wanita")}
                        style={{ padding: "8px", fontSize: "12px" }}
                      >
                        WANITA
                      </button>
                    </div>
                  </div>

                  {/* Kesamaptaan A */}
                  <h3 style={{ color: "var(--color-text-dark)", fontSize: "13px", fontWeight: "700", borderBottom: "1px solid #ddd", paddingBottom: "4px", margin: "8px 0 2px" }}>
                    GARJAS A (Daya Tahan)
                  </h3>
                  <div className="form-group" style={{ marginBottom: "4px" }}>
                    <label className="form-label" htmlFor="distance" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>Jarak Lari 12 Menit</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="distance"
                        className="input-field"
                        placeholder="Contoh: 3200"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        required
                        style={{ padding: "8px", fontSize: "12px" }}
                      />
                      <span className="input-unit" style={{ fontSize: "11px" }}>meter</span>
                    </div>
                  </div>

                  {/* Kesamaptaan B */}
                  <h3 style={{ color: "var(--color-text-dark)", fontSize: "13px", fontWeight: "700", borderBottom: "1px solid #ddd", paddingBottom: "4px", margin: "8px 0 2px" }}>
                    GARJAS B (Kekuatan & Kelincahan)
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ marginBottom: "4px" }}>
                      <label className="form-label" htmlFor="pullup" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>
                        {gender === "Pria" ? "Pull-Up (1 Menit)" : "Chinning (1 Menit)"}
                      </label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="pullup"
                          className="input-field"
                          placeholder="Contoh: 14"
                          value={pullupReps}
                          onChange={(e) => setPullupReps(e.target.value)}
                          required
                          style={{ padding: "8px", fontSize: "12px" }}
                        />
                        <span className="input-unit" style={{ fontSize: "11px" }}>kali</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: "4px" }}>
                      <label className="form-label" htmlFor="pushup" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>Push-Up (1 Menit)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="pushup"
                          className="input-field"
                          placeholder="Contoh: 35"
                          value={pushupReps}
                          onChange={(e) => setPushupReps(e.target.value)}
                          required
                          style={{ padding: "8px", fontSize: "12px" }}
                        />
                        <span className="input-unit" style={{ fontSize: "11px" }}>kali</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div className="form-group" style={{ marginBottom: "4px" }}>
                      <label className="form-label" htmlFor="situp" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>Sit-Up (1 Menit)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="situp"
                          className="input-field"
                          placeholder="Contoh: 38"
                          value={situpReps}
                          onChange={(e) => setSitupReps(e.target.value)}
                          required
                          style={{ padding: "8px", fontSize: "12px" }}
                        />
                        <span className="input-unit" style={{ fontSize: "11px" }}>kali</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: "4px" }}>
                      <label className="form-label" htmlFor="shuttle" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>Shuttle Run</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.01"
                          id="shuttle"
                          className="input-field"
                          placeholder="Contoh: 17.2"
                          value={shuttleTime}
                          onChange={(e) => setShuttleTime(e.target.value)}
                          required
                          style={{ padding: "8px", fontSize: "12px" }}
                        />
                        <span className="input-unit" style={{ fontSize: "11px" }}>detik</span>
                      </div>
                    </div>
                  </div>

                  {/* Renang */}
                  <h3 style={{ color: "var(--color-text-dark)", fontSize: "13px", fontWeight: "700", borderBottom: "1px solid #ddd", paddingBottom: "4px", margin: "8px 0 2px" }}>
                    TES RENANG (25 Meter)
                  </h3>
                  <div className="form-group" style={{ marginBottom: "4px" }}>
                    <label className="form-label" htmlFor="renang" style={{ color: "var(--color-text-dark)", fontSize: "11px" }}>Waktu Tempuh Renang</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        id="renang"
                        className="input-field"
                        placeholder="Contoh: 22.5"
                        value={renangTime}
                        onChange={(e) => setRenangTime(e.target.value)}
                        required
                        style={{ padding: "8px", fontSize: "12px" }}
                      />
                      <span className="input-unit" style={{ fontSize: "11px" }}>detik</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: "16px", padding: "12px" }} disabled={loading}>
                    {loading ? "Menghitung..." : "Hitung Nilai Gabungan"}
                  </button>
                </form>
              ) : (
                <div className="result-card" style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "20px" }}>
                  <div className="score-circle" style={{ width: "90px", height: "90px" }}>
                    <span className="score-value" style={{ fontSize: "28px" }}>{scores.nilaiAkhir}</span>
                    <span className="score-label" style={{ fontSize: "9px" }}>GABUNGAN</span>
                  </div>

                  <h3 style={{ color: "var(--color-text-dark)", marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
                    Detail Nilai Jasmani ({gender})
                  </h3>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>Lari 12 Menit ({distance}m)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.lari} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>
                      {gender === "Pria" ? `Pull-Up (${pullupReps}x)` : `Chinning (${pullupReps}x)`}
                    </span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.pullupChinning} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>Push-Up ({pushupReps}x)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.pushup} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>Sit-Up ({situpReps}x)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.situp} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>Shuttle Run ({shuttleTime}s)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.shuttleRun} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "500" }}>Renang 25 Meter ({renangTime}s)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.renang} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px", background: "rgba(13, 110, 253, 0.08)", paddingLeft: "4px", paddingRight: "4px", borderRadius: "4px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "bold" }}>Rata-rata Garjas B</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.samaptaB} Poin</strong>
                  </div>

                  <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "12px", background: "rgba(13, 110, 253, 0.08)", paddingLeft: "4px", paddingRight: "4px", borderRadius: "4px" }}>
                    <span style={{ color: "var(--color-text-dark)", fontWeight: "bold" }}>Total Samapta A&B (80%)</span>
                    <strong style={{ color: "var(--color-text-dark)" }}>{scores.samaptaAB} Poin</strong>
                  </div>

                  <p style={{ fontSize: "11px", color: "var(--color-text-body)", lineHeight: "1.4", margin: "8px 0" }}>
                    Nilai akhir dihitung dengan rumus: <br />
                    <strong>(Rata-rata Samapta A&B × 80%) + (Nilai Renang × 20%)</strong>.
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button onClick={handleReset} className="btn btn-outline" style={{ flex: 1, padding: "10px", fontSize: "12px" }}>
                      Hitung Ulang
                    </button>
                    <button onClick={() => router.push("/jasmani")} className="btn btn-primary" style={{ flex: 1, padding: "10px", fontSize: "12px" }}>
                      Kembali
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
