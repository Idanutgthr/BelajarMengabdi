import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

import QUESTIONS from "./questions.json";

export default function WawasanKebangsaan() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    setUserAnswers({ ...userAnswers, [currentIndex]: option });
  };

  const toggleBookmark = () => {
    setBookmarks({ ...bookmarks, [currentIndex]: !bookmarks[currentIndex] });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    QUESTIONS.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (!ans) skippedCount++;
      else if (ans === q.correctAnswer) correctCount++;
      else incorrectCount++;
    });

    const finalScore = Math.round((correctCount / QUESTIONS.length) * 100);
    setScore(finalScore);
    setResults({ correct: correctCount, incorrect: incorrectCount, skipped: skippedCount });

    const historyData = {
      category: "Wawasan Kebangsaan",
      score: finalScore,
      correct: correctCount,
      total: QUESTIONS.length,
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
        await addDoc(collection(db, "users", auth.currentUser.uid, "akademik_history"), historyData);
      } catch (e) {
        console.error("Gagal menyimpan ke Firestore:", e);
      }
    } else {
      const existingHistory = JSON.parse(localStorage.getItem("akademik_history") || "[]");
      localStorage.setItem("akademik_history", JSON.stringify([historyData, ...existingHistory]));
    }

    setLoading(false);
    setIsSubmitted(true);
  };

  const resetTest = () => {
    setUserAnswers({});
    setBookmarks({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setScore(0);
  };

  const q = QUESTIONS[currentIndex];

  return (
    <>
      <Head>
        <title>Wawasan Kebangsaan - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/akademik")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title" style={{ fontSize: "14px" }}>WAWASAN KEBANGSAAN</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="content-scroll-area">
              {!isSubmitted ? (
                <>
                  <div className="question-number-badge">
                    Soal {currentIndex + 1} dari {QUESTIONS.length}
                  </div>

                  <div className="question-box">
                    <p>{q.question}</p>
                  </div>

                  <div className="options-container">
                    {Object.entries(q.options).map(([letter, text]) => {
                      const isSelected = userAnswers[currentIndex] === letter;
                      return (
                        <button
                          key={letter}
                          className={`option-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelectOption(letter)}
                        >
                          <span className="option-letter">{letter}</span>
                          <span>{text}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="result-card">
                  <div className="score-circle">
                    <span className="score-value">{score}</span>
                    <span className="score-label">SKOR</span>
                  </div>

                  <h3 style={{ color: "var(--color-text-dark)", marginBottom: "20px" }}>
                    Hasil Tes Wawasan Kebangsaan
                  </h3>

                  <div className="stat-row success">
                    <span>Jawaban Benar</span>
                    <strong>{results.correct}</strong>
                  </div>
                  <div className="stat-row danger">
                    <span>Jawaban Salah</span>
                    <strong>{results.incorrect}</strong>
                  </div>
                  <div className="stat-row warning">
                    <span>Tidak Dijawab</span>
                    <strong>{results.skipped}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button onClick={resetTest} className="btn btn-outline" style={{ flex: 1 }}>
                      Coba Lagi
                    </button>
                    <button onClick={() => router.push("/akademik")} className="btn btn-primary" style={{ flex: 1 }}>
                      Kembali
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

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

              {currentIndex === QUESTIONS.length - 1 ? (
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
              {QUESTIONS.map((_, idx) => {
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
