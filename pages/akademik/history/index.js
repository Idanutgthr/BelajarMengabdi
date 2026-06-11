import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured } from "../../../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AkademikHistory() {
  const router = useRouter();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn !== "true") {
        router.push("/");
        return;
      }

      setLoading(true);

      if (isFirebaseConfigured && auth.currentUser) {
        try {
          const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "akademik_history"));
          const history = [];
          querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
          });
          // Sort in-memory by timestamp descending
          history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setHistoryList(history);
        } catch (e) {
          console.error("Gagal memuat riwayat akademik dari Firestore:", e);
        }
      } else {
        const storedHistory = localStorage.getItem("akademik_history");
        if (storedHistory) {
          setHistoryList(JSON.parse(storedHistory));
        }
      }
      setLoading(false);
    };

    if (isFirebaseConfigured) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        fetchHistory();
      });
      return () => unsubscribe();
    } else {
      fetchHistory();
    }
  }, [router]);

  const clearHistory = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat tes akademik?")) {
      setLoading(true);
      if (isFirebaseConfigured && auth.currentUser) {
        try {
          const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "akademik_history"));
          const deletePromises = [];
          querySnapshot.forEach((document) => {
            deletePromises.push(
              deleteDoc(doc(db, "users", auth.currentUser.uid, "akademik_history", document.id))
            );
          });
          await Promise.all(deletePromises);
        } catch (err) {
          console.error("Gagal menghapus riwayat dari Firestore:", err);
        }
      } else {
        localStorage.removeItem("akademik_history");
      }
      setHistoryList([]);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Riwayat Akademik - BelajarMengabdi</title>
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            {/* Top Navigation */}
            <div className="top-bar-nav">
              <button onClick={() => router.push("/akademik")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">RIWAYAT</h2>
              <div style={{ width: "38px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "24px" }}>
              <h1 className="brand-title" style={{ fontSize: "22px" }}>Riwayat Latihan</h1>
              <p className="brand-subtitle">Hasil Evaluasi Akademik</p>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-dark)", fontWeight: "700" }}>
                Memuat riwayat...
              </div>
            ) : historyList.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "36px 16px",
                background: "var(--bg-input)",
                borderRadius: "16px",
                border: "1px dashed var(--bg-button-active)",
                color: "var(--color-text-body)",
                marginTop: "20px"
              }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>📖</span>
                <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px", color: "var(--color-text-dark)" }}>Belum Ada Riwayat</p>
                <p style={{ fontSize: "12px", opacity: 0.9 }}>Kerjakan kuis terlebih dahulu untuk melihat hasil evaluasi di sini.</p>
              </div>
            ) : (
              <div className="content-scroll-area">
                {historyList.map((item) => {
                  const isHigh = item.score >= 80;
                  
                  return (
                    <div key={item.id} className="history-item">
                      <div className="history-info">
                        <span className="history-title">{item.category}</span>
                        <span className="history-date">{item.date}</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", opacity: 0.9 }}>
                          Akurasi: {item.correct}/{item.total} Soal
                        </span>
                      </div>
                      <div className="history-score" style={{ color: isHigh ? "#ffffff" : "var(--bg-input)" }}>
                        {item.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bottom-action-btn">
            {historyList.length > 0 && !loading && (
              <button onClick={clearHistory} className="btn btn-outline" style={{ marginBottom: "12px", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                Hapus Semua Riwayat
              </button>
            )}
            <button onClick={() => router.push("/akademik")} className="btn btn-secondary">
              Kembali Ke Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
