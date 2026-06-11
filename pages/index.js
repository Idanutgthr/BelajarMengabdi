import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // Check local auth state
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      router.push("/dashboard");
    }


  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Silakan isi Email dan Password!");
      return;
    }
    setError("");
    setLoading(true);

    if (isFirebaseConfigured) {
      try {
        if (isRegistering) {
          // Register User
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", userCredential.user.email);
          localStorage.setItem("userProfile", JSON.stringify({
            name: userCredential.user.email.split("@")[0].toUpperCase(),
            avatar: "/police_salute.png",
            uid: userCredential.user.uid
          }));
          router.push("/dashboard");
        } else {
          // Sign In User
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userEmail", userCredential.user.email);
          localStorage.setItem("userProfile", JSON.stringify({
            name: userCredential.user.email.split("@")[0].toUpperCase(),
            avatar: "/police_salute.png",
            uid: userCredential.user.uid
          }));
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Firebase auth error:", err);
        if (err.code === "auth/user-not-found") {
          setError("Akun tidak ditemukan. Silakan klik 'Daftar Baru' di bawah.");
        } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          setError("Email atau password salah.");
        } else if (err.code === "auth/email-already-in-use") {
          setError("Email sudah terdaftar. Silakan masuk.");
        } else if (err.code === "auth/weak-password") {
          setError("Sandi terlalu lemah (minimal 6 karakter).");
        } else {
          setError("Terjadi kesalahan: " + err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback mode
      setTimeout(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userProfile", JSON.stringify({
          name: email.split("@")[0].toUpperCase(),
          avatar: "/police_salute.png",
          uid: "local_mock_uid"
        }));
        setLoading(false);
        router.push("/dashboard");
      }, 800);
    }
  };

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
          avatar: result.user.photoURL || "/police_salute.png",
          uid: result.user.uid
        }));
        router.push("/dashboard");
      } catch (err) {
        console.error("Google login error:", err);
        setError("Gagal masuk dengan Google: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback mode
      setTimeout(() => {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", "siswa.aparat@gmail.com");
        localStorage.setItem("userProfile", JSON.stringify({
          name: "SISWA APARAT",
          avatar: "/police_salute.png",
          uid: "local_mock_uid"
        }));
        setLoading(false);
        router.push("/dashboard");
      }, 800);
    }
  };

  return (
    <>
      <Head>
        <title>BelajarMengabdi - Masuk Seleksi Kepolisian</title>
        <meta name="description" content="Website Bimbingan Belajar Mengabdi Seleksi Masuk Kepolisian" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="main-container">
        <div className="card-frame" style={{ justifyContent: "center" }}>
          <div>
            <div className="brand-title-box">
              <h1>BELAJAR MENGABDI</h1>
            </div>

            <div className="form-container-box">
              <div className="mascot-container">
                <Image
                  src="/police_salute.png"
                  alt="Maskot Polisi BelajarMengabdi"
                  width={150}
                  height={150}
                  className="mascot-image"
                  priority
                />
              </div>



              {error && (
                <div style={{
                  background: "rgba(166, 75, 42, 0.2)",
                  color: "#ffdcd0",
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "14px",
                  textAlign: "center",
                  border: "1px solid rgba(166, 75, 42, 0.3)"
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="siswa@belajarmengabdi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="input-field"
                    placeholder="Masukkan sandi Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", background: "var(--bg-login-btn)" }} disabled={loading}>
                  {loading ? "Menghubungkan..." : isRegistering ? "Daftar Akun Baru" : "Login"}
                </button>
              </form>

              <div style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "12px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                  onClick={() => setIsRegistering(!isRegistering)}
                >
                  {isRegistering ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar Baru"}
                </button>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                margin: "14px 0",
                color: "var(--color-text-white)",
                fontSize: "11px",
                fontWeight: "700",
                opacity: 0.9
              }}>
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
                Google Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
