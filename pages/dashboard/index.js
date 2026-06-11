import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "../../lib/firebase";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "SISWA", avatar: "/police_salute.png" });

  useEffect(() => {
    // Session check
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
      return;
    }

    // Load local cache profile
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    // Set up Firebase auth listener if configured
    if (isFirebaseConfigured) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          const updatedProfile = {
            name: user.displayName || user.email.split("@")[0].toUpperCase(),
            avatar: user.photoURL || "/police_salute.png",
            uid: user.uid
          };
          setProfile(updatedProfile);
          localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        } else {
          // If Firebase claims no user but we are in logged in mode, it could be loading,
          // but if we are surely logged out on Firebase, force logout locally.
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userProfile");
          router.push("/");
        }
      });
      return () => unsubscribe();
    }
  }, [router]);

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase logout error:", err);
      }
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfile");
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>Dashboard - BelajarMengabdi</title>
        <meta name="description" content="Dashboard Utama BelajarMengabdi" />
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <div className="profile-avatar">
                <Image
                  src={profile.avatar}
                  alt="Siswa"
                  width={38}
                  height={38}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <h2 className="screen-title" style={{ fontSize: "14px" }}>Hai, {profile.name}</h2>
              <button 
                onClick={handleLogout}
                className="btn-back-round"
                title="Keluar"
                style={{ transform: "none", fontSize: "14px", fontWeight: "700" }}
              >
                ✕
              </button>
            </div>

            <div className="header-brand" style={{ marginBottom: "28px", marginTop: "12px" }}>
              <h1 className="brand-title" style={{ fontSize: "24px" }}>BELAJAR MENGABDI</h1>
              <p className="brand-subtitle" style={{ fontSize: "12px" }}>Menu Utama Seleksi</p>
            </div>

            <div className="menu-list" style={{ gap: "12px" }}>
              <Link href="/psikotes">
                <button className="btn btn-menu" style={{ padding: "18px", fontSize: "16px" }}>
                  PSIKOTES
                </button>
              </Link>
              
              <Link href="/akademik">
                <button className="btn btn-menu" style={{ padding: "18px", fontSize: "16px" }}>
                  AKADEMIK
                </button>
              </Link>

              <Link href="/jasmani">
                <button className="btn btn-menu" style={{ padding: "18px", fontSize: "16px" }}>
                  JASMANI
                </button>
              </Link>
            </div>
          </div>

          <div className="bottom-action-btn">
            <Link href="/information">
              <button className="btn btn-secondary" style={{ padding: "16px", fontWeight: "700" }}>
                INFORMATION
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
