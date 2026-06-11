import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SikapKerjaTest() {
  const router = useRouter();
  const [gameState, setGameState] = useState("select"); // "select", "instructions", "playing", "result"
  const [subtest, setSubtest] = useState(null); // "angka", "huruf", "simbol"
  
  // Game Play States
  const [column, setColumn] = useState(1);
  const [questionNum, setQuestionNum] = useState(1);
  const [masterKey, setMasterKey] = useState([]);
  const [questionChars, setQuestionChars] = useState([]);
  const [missingChar, setMissingChar] = useState("");
  
  // Timer & Results states
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute = 60 seconds
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [columnResults, setColumnResults] = useState([]); // array of { column, correct, attempted, accuracy }
  
  const [overallStats, setOverallStats] = useState({
    totalCorrect: 0,
    totalAttempted: 0,
    accuracy: 0,
    speed: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  const getPool = (type) => {
    if (type === "angka") {
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    } else if (type === "huruf") {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    } else {
      return ['▲', '▼', '◆', '●', '■', '★', '♣', '♦', '♥', '♠', '✦', '✖'];
    }
  };

  const selectSubtest = (type) => {
    setSubtest(type);
    setGameState("instructions");
  };

  const startTest = () => {
    setGameState("playing");
    setColumn(1);
    setQuestionNum(1);
    setCorrectCount(0);
    setAttemptedCount(0);
    setColumnResults([]);
    setTimeLeft(60);

    const pool = getPool(subtest);
    const newMasterKey = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    setMasterKey(newMasterKey);
    generateQuestion(newMasterKey);
  };

  const generateQuestion = (currentMasterKey) => {
    const missingIdx = Math.floor(Math.random() * 5);
    const missing = currentMasterKey[missingIdx];

    const remaining = currentMasterKey.filter((_, idx) => idx !== missingIdx);
    const shuffledQuestion = [...remaining].sort(() => Math.random() - 0.5);

    setMissingChar(missing);
    setQuestionChars(shuffledQuestion);
  };

  const moveToNextColumn = (finalCorrect, finalAttempted) => {
    const newColResult = {
      column: column,
      correct: finalCorrect,
      attempted: finalAttempted,
      accuracy: finalAttempted > 0 ? Math.round((finalCorrect / finalAttempted) * 100) : 0
    };

    const updatedColResults = [...columnResults, newColResult];
    setColumnResults(updatedColResults);

    if (column >= 10) {
      endGame(updatedColResults);
    } else {
      const nextCol = column + 1;
      setColumn(nextCol);
      
      const pool = getPool(subtest);
      const newMasterKey = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
      setMasterKey(newMasterKey);
      
      setQuestionNum(1);
      setCorrectCount(0);
      setAttemptedCount(0);
      setTimeLeft(60);
      
      generateQuestion(newMasterKey);
    }
  };

  const handleAnswer = (selectedChar) => {
    if (gameState !== "playing") return;

    const isCorrect = selectedChar === missingChar;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextAttempted = attemptedCount + 1;

    setCorrectCount(nextCorrect);
    setAttemptedCount(nextAttempted);

    if (questionNum >= 50) {
      moveToNextColumn(nextCorrect, nextAttempted);
    } else {
      setQuestionNum(prev => prev + 1);
      generateQuestion(masterKey);
    }
  };

  // Keyboard shortcut integration using refs to avoid stale closures
  const handleAnswerRef = useRef();
  handleAnswerRef.current = handleAnswer;

  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      let selectedChar = null;

      // 1. Check if it's position-based (1, 2, 3, 4, 5)
      if (["1", "2", "3", "4", "5"].includes(key)) {
        const index = parseInt(key) - 1;
        selectedChar = masterKey[index];
      }
      // 2. Or check if it's letter-based (A, B, C, D, E) for positions
      else if (["A", "B", "C", "D", "E"].includes(key)) {
        const index = ["A", "B", "C", "D", "E"].indexOf(key);
        selectedChar = masterKey[index];
      }
      // 3. Or check if it's the actual character typed
      else {
        const matchedChar = masterKey.find(c => c.toUpperCase() === key);
        if (matchedChar) {
          selectedChar = matchedChar;
        }
      }

      if (selectedChar) {
        e.preventDefault();
        handleAnswerRef.current(selectedChar);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, masterKey]);

  // Timeout logic
  const handleTimeout = () => {
    moveToNextColumn(correctCount, attemptedCount);
  };
  const handleTimeoutRef = useRef();
  handleTimeoutRef.current = handleTimeout;

  // Column timer interval
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, column]);

  const endGame = async (finalColResults) => {
    setGameState("result");

    let totalCorrect = 0;
    let totalAttempted = 0;

    finalColResults.forEach(res => {
      totalCorrect += res.correct;
      totalAttempted += res.attempted;
    });

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const speed = totalAttempted;

    setOverallStats({
      totalCorrect,
      totalAttempted,
      accuracy,
      speed
    });

    setSaving(true);
    let subtestLabel = "";
    if (subtest === "angka") subtestLabel = "Angka Hilang";
    else if (subtest === "huruf") subtestLabel = "Huruf Hilang";
    else if (subtest === "simbol") subtestLabel = "Simbol Hilang";

    const historyData = {
      category: `Sikap Kerja`,
      subCategory: subtestLabel,
      score: accuracy,
      correct: totalCorrect,
      total: totalAttempted,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await addDoc(collection(db, "users", auth.currentUser.uid, "psikotes_history"), historyData);
      } catch (e) {
        console.error("Gagal menyimpan ke Firestore:", e);
      }
    } else {
      const existingHistory = JSON.parse(localStorage.getItem("psikotes_history") || "[]");
      localStorage.setItem("psikotes_history", JSON.stringify([historyData, ...existingHistory]));
    }
    setSaving(false);
  };

  const getSubtestTitle = () => {
    if (subtest === "angka") return "Angka Hilang";
    if (subtest === "huruf") return "Huruf Hilang";
    if (subtest === "simbol") return "Simbol Hilang";
    return "";
  };

  return (
    <>
      <Head>
        <title>Sikap Kerja - Psikotes BelajarMengabdi</title>
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `

        .btn-back-round {
          background-color: var(--bg-button);
          border: none;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .btn-back-round:hover {
          background-color: var(--bg-button-hover);
        }
        .screen-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-dark);
          text-transform: uppercase;
        }
        .menu-list-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }
        .btn-subtest {
          background-color: var(--bg-button);
          color: white;
          border: none;
          padding: 20px;
          border-radius: var(--border-radius-md);
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: var(--box-shadow);
          text-align: center;
          letter-spacing: 0.5px;
        }
        .btn-subtest:hover {
          background-color: var(--bg-button-hover);
          transform: translateY(-2px);
        }
        .instruction-box {
          background-color: var(--bg-input);
          border: 1px solid var(--bg-button);
          border-radius: 20px;
          padding: 20px;
          margin: 20px 0;
          font-size: 13px;
          color: var(--color-text-body);
          line-height: 1.6;
        }
        .instruction-title {
          font-weight: 800;
          color: var(--color-text-dark);
          margin-bottom: 12px;
          font-size: 15px;
        }
        .instruction-item {
          margin-bottom: 8px;
          display: flex;
          gap: 6px;
        }
        .question-chars-panel {
          background-color: white;
          border: 1px solid rgba(134, 99, 59, 0.12);
          border-radius: var(--border-radius-md);
          padding: 24px;
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 16px 0;
          box-shadow: 0 4px 12px rgba(134, 99, 59, 0.05);
        }
        .question-char {
          font-size: 32px;
          font-weight: 800;
          color: var(--color-text-dark);
        }
        .options-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 24px;
        }
        .btn-option-kecermatan {
          background-color: var(--bg-button);
          border: none;
          color: white;
          padding: 16px 8px;
          border-radius: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          box-shadow: 0 4px 8px rgba(134, 99, 59, 0.15);
        }
        .btn-option-kecermatan:hover {
          background-color: var(--bg-button-hover);
          transform: translateY(-1px);
        }
        .btn-option-kecermatan:active {
          background-color: var(--bg-button-active);
        }
        .option-char-main {
          font-size: 24px;
          font-weight: 800;
        }
        .progress-bar-container {
          width: 100%;
          height: 6px;
          background-color: rgba(134, 99, 59, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin: 12px 0;
        }
        .progress-bar-fill {
          height: 100%;
          background-color: var(--bg-button-active);
          transition: width 0.2s ease;
        }
        .progress-bar-fill.warning {
          background-color: var(--color-danger);
        }
        .keyboard-hint {
          text-align: center;
          font-size: 11px;
          color: var(--color-text-body);
          opacity: 0.8;
          margin-top: 16px;
          font-weight: 500;
        }
        /* Results Table and Chart Styles */
        .chart-container {
          margin-top: 20px;
          background: white;
          border-radius: var(--border-radius-md);
          padding: 16px 12px;
          border: 1px solid rgba(134, 99, 59, 0.08);
          max-height: 280px;
          overflow-y: auto;
        }
        .chart-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .chart-label {
          width: 50px;
          font-weight: 800;
          color: var(--color-text-dark);
        }
        .chart-bars {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin: 0 8px;
        }
        .chart-bar-speed {
          height: 6px;
          background-color: var(--color-info);
          border-radius: 3px;
          min-width: 4px;
        }
        .chart-bar-acc {
          height: 6px;
          background-color: var(--color-success);
          border-radius: 3px;
          min-width: 4px;
        }
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
      ` }} />

      <div className="main-container">
        <div className="card-frame" style={{ height: gameState === "result" ? "820px" : "750px" }}>
          <div>
            {/* Top Navigation */}
            <div className="top-bar-nav">
              <button 
                onClick={() => {
                  if (gameState === "playing") {
                    if (confirm("Apakah Anda yakin ingin keluar dari tes ini? Riwayat saat ini tidak akan disimpan.")) {
                      setGameState("select");
                    }
                  } else if (gameState === "instructions" || gameState === "result") {
                    setGameState("select");
                  } else {
                    router.push("/psikotes");
                  }
                }} 
                className="btn-back-round"
                id="btn_back_sikap_kerja"
              >
                ←
              </button>
              <h2 className="screen-title" id="title_sikap_kerja">SIKAP KERJA</h2>
              {gameState === "playing" ? (
                <div style={{
                  background: timeLeft <= 10 ? "var(--color-danger)" : "var(--bg-button-active)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "700"
                }} id="timer_sikap_kerja">
                  ⏱️ {timeLeft}s
                </div>
              ) : (
                <div style={{ width: "38px" }}></div>
              )}
            </div>

            <div className="content-scroll-area">
              {/* STATE 1: SELECT SUBTEST */}
              {gameState === "select" && (
                <div>
                  <div className="header-brand" style={{ marginBottom: "20px" }}>
                    <h1 className="brand-title" style={{ fontSize: "20px" }}>Sikap Kerja</h1>
                    <p className="brand-subtitle" style={{ fontSize: "12px" }}>Tes Kecermatan</p>
                  </div>

                  <div className="instruction-box" style={{ margin: "10px 0" }}>
                    <div className="instruction-title">Pilih Subtes:</div>
                    <p>Latih konsentrasi, kecepatan, dan ketahanan mental Anda dengan memilih jenis elemen yang ingin diuji di bawah ini.</p>
                  </div>

                  <div className="menu-list-buttons">
                    <button 
                      onClick={() => selectSubtest("angka")} 
                      className="btn-subtest"
                      id="btn_subtest_angka"
                    >
                      🔢 ANGKA HILANG
                    </button>
                    <button 
                      onClick={() => selectSubtest("huruf")} 
                      className="btn-subtest"
                      id="btn_subtest_huruf"
                    >
                      🔤 HURUF HILANG
                    </button>
                    <button 
                      onClick={() => selectSubtest("simbol")} 
                      className="btn-subtest"
                      id="btn_subtest_simbol"
                    >
                      ⭐ SIMBOL HILANG
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 2: INSTRUCTIONS */}
              {gameState === "instructions" && (
                <div>
                  <div className="header-brand" style={{ marginBottom: "16px" }}>
                    <h1 className="brand-title" style={{ fontSize: "20px" }}>{getSubtestTitle()}</h1>
                    <p className="brand-subtitle" style={{ fontSize: "12px" }}>Instruksi Pengerjaan</p>
                  </div>

                  <div className="instruction-box">
                    <div className="instruction-title">Aturan Simulasi:</div>
                    <div className="instruction-item">
                      <span>1.</span>
                      <span>Terdapat **10 Kolom** pengerjaan berturut-turut.</span>
                    </div>
                    <div className="instruction-item">
                      <span>2.</span>
                      <span>Tiap kolom berisi **50 soal acak** yang diselesaikan dalam alokasi waktu **1 menit**.</span>
                    </div>
                    <div className="instruction-item">
                      <span>3.</span>
                      <span>Temukan karakter yang **hilang** dari 4 karakter soal dibanding 5 pilihan jawaban yang tersedia, lalu pilih tombol yang sesuai.</span>
                    </div>
                    <div className="instruction-item">
                      <span>4.</span>
                      <span>Sistem akan langsung berganti kolom jika waktu habis atau 50 soal selesai dijawab.</span>
                    </div>
                  </div>

                  <div className="instruction-box" style={{ background: "rgba(134, 99, 59, 0.08)" }}>
                    <div className="instruction-title" style={{ fontSize: "12px", marginBottom: "4px" }}>💡 Pintasan Keyboard:</div>
                    <p style={{ fontSize: "11px" }}>Tekan tombol angka **1, 2, 3, 4, 5** (sesuai posisi tombol dari kiri ke kanan) atau tekan tombol karakter secara langsung untuk menjawab dengan cepat!</p>
                  </div>

                  <button 
                    onClick={startTest} 
                    className="btn btn-primary"
                    style={{ padding: "16px", marginTop: "10px" }}
                    id="btn_start_sikap_kerja"
                  >
                    MULAI SIMULASI
                  </button>
                </div>
              )}

              {/* STATE 3: PLAYING */}
              {gameState === "playing" && (
                <div>
                  <div style={{ display: "flex", justifycontent: "space-between", fontSize: "12px", fontWeight: "800", color: "var(--color-text-dark)", marginBottom: "4px" }}>
                    <span id="label_current_column">Kolom {column} dari 10</span>
                    <span id="label_current_question">Soal {questionNum} / 50</span>
                  </div>

                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${timeLeft <= 10 ? "warning" : ""}`}
                      style={{ width: `${(questionNum / 50) * 100}%` }}
                      id="progress_bar_sikap_kerja"
                    ></div>
                  </div>

                  {/* Question Area */}
                  <div className="header-brand" style={{ margin: "24px 0 10px 0" }}>
                    <p className="brand-subtitle" style={{ fontSize: "11px" }}>Karakter yang hilang:</p>
                  </div>

                  <div className="question-chars-panel" id="question_chars_panel">
                    {questionChars.map((char, idx) => (
                      <span key={idx} className="question-char">{char}</span>
                    ))}
                  </div>

                  {/* Options grid */}
                  <div className="options-grid-5" id="options_grid_sikap_kerja">
                    {masterKey.map((char, idx) => (
                      <button 
                        key={idx} 
                        className="btn-option-kecermatan"
                        onClick={() => handleAnswer(char)}
                        id={`btn_option_${idx}`}
                      >
                        <span className="option-char-main">{char}</span>
                      </button>
                    ))}
                  </div>

                  <div className="keyboard-hint">
                    Pintasan: tekan tombol [1]-[5] atau karakter langsung
                  </div>
                </div>
              )}

              {/* STATE 4: RESULT */}
              {gameState === "result" && (
                <div>
                  <div className="result-card" style={{ padding: "0 4px" }}>
                    <div className="score-circle" style={{ backgroundColor: "var(--color-success)", margin: "0 auto 16px auto" }}>
                      <span className="score-value">{overallStats.accuracy}%</span>
                      <span className="score-label">AKURASI</span>
                    </div>

                    <h3 style={{ color: "var(--color-text-dark)", marginBottom: "8px", textAlign: "center" }}>
                      {saving ? "Menyimpan Hasil..." : "Simulasi Selesai!"}
                    </h3>

                    <p style={{ fontSize: "12px", color: "var(--color-text-body)", lineHeight: "1.4", marginBottom: "16px", textAlign: "center" }}>
                      Tingkat akurasi menunjukkan konsentrasi kerja Anda, sementara jumlah soal terjawab merefleksikan kecepatan kerja Anda.
                    </p>

                    <div className="stat-row success" style={{ padding: "8px 12px", marginBottom: "8px" }}>
                      <span>Kecepatan (Terjawab)</span>
                      <strong>{overallStats.totalAttempted} soal</strong>
                    </div>
                    <div className="stat-row info" style={{ padding: "8px 12px", marginBottom: "8px" }}>
                      <span>Ketelitian (Benar)</span>
                      <strong>{overallStats.totalCorrect} soal</strong>
                    </div>

                    {/* Chart Breakdown */}
                    <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-text-dark)", marginTop: "16px" }}>
                      Grafik Konsistensi per Kolom:
                    </div>

                    <div className="chart-container" id="column_chart_container">
                      {columnResults.map((res) => (
                        <div key={res.column} className="chart-row">
                          <div className="chart-label">Kolom {res.column}</div>
                          <div className="chart-bars">
                            {/* Speed bar: base max 50 answers */}
                            <div 
                              className="chart-bar-speed" 
                              style={{ width: `${Math.min((res.attempted / 50) * 100, 100)}%` }}
                              title={`Menjawab ${res.attempted} soal`}
                            ></div>
                            {/* Accuracy bar: correctness percentage */}
                            <div 
                              className="chart-bar-acc" 
                              style={{ width: `${res.accuracy}%` }}
                              title={`Akurasi ${res.accuracy}%`}
                            ></div>
                          </div>
                          <div style={{ width: "45px", textAlign: "right", fontWeight: "700", opacity: 0.9 }}>
                            {res.correct}/{res.attempted}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: "var(--color-info)" }}></div>
                        <span>Kecepatan (Jawaban)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: "var(--color-success)" }}></div>
                        <span>Akurasi (%)</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                      <button onClick={startTest} className="btn btn-outline" style={{ flex: 1 }} disabled={saving} id="btn_retry_sikap_kerja">
                        Coba Lagi
                      </button>
                      <button 
                        onClick={() => setGameState("select")} 
                        className="btn btn-primary" 
                        style={{ flex: 1 }} 
                        disabled={saving}
                        id="btn_finish_sikap_kerja"
                      >
                        Kembali
                      </button>
                    </div>
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
