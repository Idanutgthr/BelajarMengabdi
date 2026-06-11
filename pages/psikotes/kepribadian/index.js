import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

import KEPRIBADIAN_QUESTIONS from "./questions.json";

export default function KepribadianTest() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1350); // 22 minutes 30 seconds = 1350 seconds

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
      return;
    }
    // Shuffle and pick 50 questions
    const shuffled = [...KEPRIBADIAN_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));
    setQuestions(selected);
    setMaxPossibleScore(selected.length * 10);
    setIsLoaded(true);
  }, [router]);

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    setUserAnswers({
      ...userAnswers,
      [currentIndex]: option
    });
  };

  const toggleBookmark = () => {
    setBookmarks({
      ...bookmarks,
      [currentIndex]: !bookmarks[currentIndex]
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < KEPRIBADIAN_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    let totalScore = 0;
    let answeredCount = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans) {
        totalScore += q.weights[ans];
        answeredCount++;
      }
    });

    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    setScore(percentageScore);

    const historyData = {
      category: "Kepribadian",
      score: percentageScore,
      correct: answeredCount,
      total: questions.length,
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

    setLoading(false);
    setIsSubmitted(true);
  };

  const handleSubmitRef = useRef();
  handleSubmitRef.current = handleSubmit;

  // Timer effect
  useEffect(() => {
    if (isSubmitted || !isLoaded) return;

    if (timeLeft <= 0) {
      handleSubmitRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, isLoaded]);

  const resetTest = () => {
    setUserAnswers({});
    setBookmarks({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);

    // Shuffle and pick a new set of 50 questions
    const shuffled = [...KEPRIBADIAN_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));
    setQuestions(selected);
    setMaxPossibleScore(selected.length * 10);
    setTimeLeft(1350); // Reset timer to 22m 30s
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const q = questions[currentIndex];

  if (!isLoaded || questions.length === 0) {
    return (
      <>
        <Head>
          <title>Kepribadian - Psikotes BelajarMengabdi</title>
        </Head>
        <div className="main-container">
          <div className="card-frame" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="loading-spinner" style={{ color: "var(--color-text-dark)", fontWeight: "bold" }}>
              Memuat Soal...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Kepribadian - Psikotes BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            {/* Top Navigation */}
            <div className="top-bar-nav">
              <button onClick={() => router.push("/psikotes")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">KEPRIBADIAN</h2>
              {!isSubmitted ? (
                <div style={{
                  backgroundColor: "var(--bg-button-active)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              ) : (
                <div style={{ width: "38px" }}></div>
              )}
            </div>

            <div className="content-scroll-area">
              {!isSubmitted ? (
                <>
                  <div className="question-number-badge">
                    Soal {currentIndex + 1} dari {questions.length}
                  </div>

                  {/* Question Box */}
                  <div className="question-box">
                    <p>{q.question}</p>
                  </div>

                  {/* Options */}
                  <div className="options-container">
                    {Object.entries(q.options).map(([letter, text]) => {
                      const isSelected = userAnswers[currentIndex] === letter;
                      return (
                        <button
                          key={letter}
                          className={`option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectOption(letter)}
                          style={{ alignItems: "flex-start", padding: "12px" }}
                        >
                          <span className="option-letter" style={{ flexShrink: 0, marginTop: "2px" }}>{letter}</span>
                          <span style={{ fontSize: "13px", lineHeight: "1.4" }}>{text}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Result Card View */
                <div className="result-card">
                  <div className="score-circle" style={{ backgroundColor: "var(--color-success)" }}>
                    <span className="score-value">{score}%</span>
                    <span className="score-label">MATCH</span>
                  </div>

                  <h3 style={{ color: "var(--color-text-dark)", marginBottom: "12px" }}>
                    Hasil Tes Kepribadian
                  </h3>

                  <p style={{ fontSize: "13px", color: "var(--color-text-body)", lineHeight: "1.4", marginBottom: "20px" }}>
                    Skor Anda menunjukkan tingkat kesesuaian sikap mental dan kepribadian Anda dengan standar karakter Bhayangkara Polri yang jujur, disiplin, berintegritas, dan melayani.
                  </p>

                  <div className="stat-row success">
                    <span>Kecocokan Integritas</span>
                    <strong>{score >= 80 ? "Sangat Baik" : score >= 60 ? "Cukup Baik" : "Perlu Bimbingan"}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button onClick={resetTest} className="btn btn-outline" style={{ flex: 1 }}>
                      Coba Lagi
                    </button>
                    <button onClick={() => router.push("/psikotes")} className="btn btn-primary" style={{ flex: 1 }}>
                      Kembali
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation for Test Taking */}
          {!isSubmitted && (
            <div className="bottom-nav-bar">
              <button
                className="nav-icon-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
              >
                ←
              </button>

              <button
                className={`nav-icon-btn ${bookmarks[currentIndex] ? "active" : ""}`}
                onClick={toggleBookmark}
              >
                ★
              </button>

              <button className="nav-icon-btn" onClick={() => setShowGrid(true)}>
                ☰
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: "auto", padding: "10px 20px", fontSize: "13px", borderRadius: "16px", backgroundColor: "var(--bg-login-btn)" }}
                >
                  {loading ? "Menyimpan..." : "SELESAI"}
                </button>
              ) : (
                <button className="nav-icon-btn" onClick={handleNext}>
                  →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid Modal */}
      {showGrid && (
        <div className="modal-overlay" onClick={() => setShowGrid(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Daftar Soal</h3>
              <button className="modal-close" onClick={() => setShowGrid(false)}>
                ✕
              </button>
            </div>

            <div className="number-grid">
              {questions.map((_, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isBookmarked = bookmarks[idx] === true;
                const isCurrent = idx === currentIndex;

                let cellClass = "";
                if (isAnswered) cellClass += " answered";
                if (isBookmarked) cellClass += " bookmarked";
                if (isCurrent) cellClass += " current";

                return (
                  <button
                    key={idx}
                    className={`number-cell ${cellClass}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowGrid(false);
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
