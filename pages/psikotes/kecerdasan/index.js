import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

import KECERDASAN_QUESTIONS from "./questions.json";

export default function KecerdasanTest() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes = 3600 seconds

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
      return;
    }
    // Shuffle and pick 50 questions
    const shuffled = [...KECERDASAN_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));
    setQuestions(selected);
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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (!ans) {
        skippedCount++;
      } else if (ans === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setResults({ correct: correctCount, incorrect: incorrectCount, skipped: skippedCount });

    // History Item data structure
    const historyData = {
      category: "Kecerdasan",
      score: finalScore,
      correct: correctCount,
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

    // Save to Firebase Firestore if configured and user is signed in
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        await addDoc(collection(db, "users", auth.currentUser.uid, "psikotes_history"), historyData);
      } catch (e) {
        console.error("Gagal menyimpan ke Firestore:", e);
      }
    } else {
      // Offline fallback: save to localStorage
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
    const shuffled = [...KECERDASAN_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));
    setQuestions(selected);
    setTimeLeft(3600); // Reset timer to 60 minutes
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
          <title>Kecerdasan - Psikotes BelajarMengabdi</title>
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
        <title>Kecerdasan - Psikotes BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            {/* Top Navigation */}
            <div className="top-bar-nav">
              <button onClick={() => router.push("/psikotes")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">KECERDASAN</h2>
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
                    <p style={{ whiteSpace: "pre-line" }}>{q.question}</p>
                    {q.image && (
                      <div className="question-image" style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.image}
                          alt="Soal"
                          style={{ maxWidth: "100%", maxHeight: "280px", borderRadius: "12px", border: "1px solid #cfb084", backgroundColor: "#fff", padding: "8px" }}
                        />
                      </div>
                    )}
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
                        >
                          <span className="option-letter">{letter}</span>
                          <span>{text}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Result Card View */
                <div className="result-card">
                  <div className="score-circle">
                    <span className="score-value">{score}</span>
                    <span className="score-label">SKOR</span>
                  </div>

                  <h3 style={{ color: "var(--color-text-dark)", marginBottom: "20px" }}>
                    Simulasi Tes Selesai!
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
