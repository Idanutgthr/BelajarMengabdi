import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  signOut
} from "firebase/auth";

export default function Home() {
  const router = useRouter();

  // "login" | "register"
  const [screen, setScreen] = useState("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Popup setelah daftar
  const [showPopup, setShowPopup] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Resend state
  const [lastUser, setLastUser] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [resendInfo, setResendInfo] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const switchScreen = (s) => {
    setScreen(s);
    setError("");
    setResendInfo("");
    setShowResend(false);
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Silakan isi Email dan Password!");
      return;
    }
    setError("");
    setResendInfo("");
    setShowResend(false);
    setLoading(true);

    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        const user = userCredential.user;
        await user.reload();

        if (!user.emailVerified) {
          await auth.signOut();
          setLastUser(user);
          setShowResend(true);
          setError("Email kamu belum diverifikasi. Klik link di email terlebih dahulu.");
        } else {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userProfile", JSON.stringify({
            name: user.displayName || user.email.split("@")[0].toUpperCase(),
            avatar: user.photoURL || "/JadiAbdiPolisi.png",
            uid: user.uid
          }));
          router.push("/dashboard");
        }
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          setError("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
        } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          setError("Email atau password salah.");
        } else {
          setError("Terjadi kesalahan: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", loginEmail);
        localStorage.setItem("userProfile", JSON.stringify({
          name: loginEmail.split("@")[0].toUpperCase(),
          avatar: "/JadiAbdiPolisi.png",
          uid: "local_mock_uid"
        }));
        setLoading(false);
        router.push("/dashboard");
      }, 800);
    }
  };

  // ── REGISTER ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError("Semua kolom harus diisi!");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setError("");
    setLoading(true);

    if (isFirebaseConfigured) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        await updateProfile(userCredential.user, { displayName: regName });
        await sendEmailVerification(userCredential.user);
        setLastUser(userCredential.user);
        setRegisteredEmail(regEmail);
        await signOut(auth);
        setLoading(false);
        setShowPopup(true);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          setError("Email sudah terdaftar. Silakan masuk.");
        } else if (err.code === "auth/weak-password") {
          setError("Sandi terlalu lemah (minimal 6 karakter).");
        } else if (err.code === "auth/invalid-email") {
          setError("Format email tidak valid.");
        } else {
          setError("Terjadi kesalahan: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setLoading(false);
        setRegisteredEmail(regEmail);
        setShowPopup(true);
      }, 800);
    }
  };

  // ── RESEND VERIFICATION ────────────────────────────────
  const handleResend = async () => {
    if (!lastUser) return;
    setLoading(true);
    setResendInfo("");
    try {
      await sendEmailVerification(lastUser);
      setResendInfo("Email verifikasi telah dikirim ulang. Cek inbox atau folder Spam.");
    } catch (err) {
      setError("Gagal mengirim ulang: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── GOOGLE LOGIN ───────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    if (isFirebaseConfigured) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", result.user.email);
        localStorage.setItem("userProfile", JSON.stringify({
          name: result.user.displayName || result.user.email.split("@")[0].toUpperCase(),
          avatar: result.user.photoURL || "/JadiAbdiPolisi.png",
          uid: result.user.uid
        }));
        router.push("/dashboard");
      } catch (err) {
        setError("Gagal masuk dengan Google: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", "siswa.aparat@gmail.com");
        localStorage.setItem("userProfile", JSON.stringify({
          name: "SISWA APARAT",
          avatar: "/JadiAbdiPolisi.png",
          uid: "local_mock_uid"
        }));
        setLoading(false);
        router.push("/dashboard");
      }, 800);
    }
  };

  // ── RENDER ─────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>BelajarMengabdi - Masuk Seleksi Kepolisian</title>
        <meta name="description" content="Website Bimbingan Belajar Mengabdi Seleksi Masuk Kepolisian" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Logo — selalu terlihat di atas */}
            <div className="brand-title-box" style={{ margin: "28px 20px 16px", flexShrink: 0 }}>
              <h1>BELAJAR MENGABDI</h1>
            </div>

            {/* Area scroll — hanya form-container-box yang scroll */}
            <div className="hide-scrollbar" style={{ overflowY: "auto", flex: 1, padding: "0 20px 28px" }}>
            <div className="form-container-box">
              {/* Mascot */}
              <div className="mascot-container">
                <Image
                  src="/JadiAbdiPolisi.png"
                  alt="Logo Belajar Mengabdi"
                  width={160}
                  height={160}
                  className="mascot-image"
                  priority
                  style={{ borderRadius: "14px", objectFit: "contain" }}
                />
              </div>

              {/* Tab Switch */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
                <button
                  type="button"
                  onClick={() => switchScreen("login")}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: "12px",
                    border: "none",
                    fontFamily: "inherit",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: screen === "login" ? "var(--bg-button-active)" : "rgba(255,255,255,0.15)",
                    color: "white",
                    transition: "all 0.2s",
                    letterSpacing: "0.5px"
                  }}
                >
                  MASUK
                </button>
                <button
                  type="button"
                  onClick={() => switchScreen("register")}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: "12px",
                    border: "none",
                    fontFamily: "inherit",
                    fontWeight: "800",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: screen === "register" ? "var(--bg-button-active)" : "rgba(255,255,255,0.15)",
                    color: "white",
                    transition: "all 0.2s",
                    letterSpacing: "0.5px"
                  }}
                >
                  DAFTAR
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(166, 75, 42, 0.25)",
                  color: "#ffdcd0",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(166, 75, 42, 0.35)"
                }}>
                  {error}
                </div>
              )}

              {/* Resend info */}
              {resendInfo && (
                <div style={{
                  background: "rgba(96, 123, 83, 0.25)",
                  color: "#d8f0cb",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(96, 123, 83, 0.4)"
                }}>
                  {resendInfo}
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {screen === "login" && (
                <>
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="login-email">Email</label>
                      <input
                        type="email"
                        id="login-email"
                        className="input-field"
                        placeholder="siswa@belajarmengabdi.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="login-password">Password</label>
                      <input
                        type="password"
                        id="login-password"
                        className="input-field"
                        placeholder="Masukkan sandi Anda"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", background: "var(--bg-login-btn)" }} disabled={loading}>
                      {loading ? "Menghubungkan..." : "Masuk"}
                    </button>
                  </form>

                  {/* Resend button (muncul jika belum verifikasi) */}
                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: "10px",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.35)",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}
                    >
                      Kirim Ulang Email Verifikasi
                    </button>
                  )}

                  <div style={{ display: "flex", alignItems: "center", margin: "14px 0", color: "white", fontSize: "11px", fontWeight: "700", opacity: 0.9 }}>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.3)" }}></div>
                    <span style={{ padding: "0 8px", textTransform: "uppercase" }}>atau</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.3)" }}></div>
                  </div>

                  <button onClick={handleGoogleLogin} className="btn btn-google" style={{ width: "100%" }} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                      <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.9c1.69-1.55 2.69-3.85 2.69-6.58z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.25c-.8.54-1.83.87-3.06.87-2.35 0-4.34-1.58-5.05-3.72H.9v2.3C2.38 15.94 5.43 18 9 18z" />
                      <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3.05-2.3z" />
                      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.3C13.46.86 11.43 0 9 0 5.43 0 2.38 2.06.9 5v2.3l3.05 2.3C4.66 5.16 6.65 3.58 9 3.58z" />
                    </svg>
                    Masuk dengan Google
                  </button>
                </>
              )}

              {/* ── REGISTER FORM ── */}
              {screen === "register" && (
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-name">Nama Lengkap</label>
                    <input
                      type="text"
                      id="reg-name"
                      className="input-field"
                      placeholder="Nama lengkap kamu"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-email">Email</label>
                    <input
                      type="email"
                      id="reg-email"
                      className="input-field"
                      placeholder="siswa@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-password">Password</label>
                    <input
                      type="password"
                      id="reg-password"
                      className="input-field"
                      placeholder="Minimal 6 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-confirm">Konfirmasi Password</label>
                    <input
                      type="password"
                      id="reg-confirm"
                      className="input-field"
                      placeholder="Ulangi password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", background: "var(--bg-login-btn)" }} disabled={loading}>
                    {loading ? "Mendaftarkan..." : "Buat Akun"}
                  </button>
                </form>
              )}
            </div>
            </div> {/* end scroll area */}
          </div>
        </div>
      </div>

      {/* ── POPUP SETELAH DAFTAR ── */}
      {showPopup && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(94, 69, 40, 0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px"
        }}>
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            padding: "28px 24px",
            maxWidth: "360px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(94, 69, 40, 0.3)",
            border: "1px solid rgba(134, 99, 59, 0.15)",
            textAlign: "center"
          }}>
            {/* Icon */}
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--bg-button-active)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="white"/>
              </svg>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--color-text-dark)", marginBottom: "12px" }}>
              Verifikasi Email Kamu
            </h3>

            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--color-text-body)", marginBottom: "8px" }}>
              Email verifikasi telah dikirim ke:
            </p>
            <p style={{ fontSize: "13px", fontWeight: "800", color: "var(--bg-button-active)", marginBottom: "16px", wordBreak: "break-all" }}>
              {registeredEmail}
            </p>

            <div style={{
              background: "rgba(192, 145, 63, 0.12)",
              border: "1px solid rgba(192, 145, 63, 0.3)",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <p style={{ fontSize: "12px", lineHeight: "1.7", color: "var(--color-text-body)", fontWeight: "600" }}>
                Jika email tidak masuk di <strong>Inbox</strong>, segera cek folder <strong>Spam</strong> atau <strong>Junk</strong>. Tandai sebagai &quot;Bukan Spam&quot; agar email berikutnya masuk dengan benar.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href="https://mail.google.com/mail/u/0/#spam"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "12px",
                  background: "var(--bg-button-active)",
                  color: "white",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "13px",
                  textDecoration: "none",
                  textAlign: "center",
                  letterSpacing: "0.3px"
                }}
              >
                Buka Gmail / Folder Spam
              </a>

              <button
                type="button"
                onClick={() => { setShowPopup(false); switchScreen("login"); }}
                style={{
                  padding: "12px",
                  background: "var(--bg-button)",
                  color: "white",
                  borderRadius: "14px",
                  fontWeight: "700",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
              >
                Sudah Verifikasi, Lanjut Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
