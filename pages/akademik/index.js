import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AkademikMenu() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Akademik - BelajarMengabdi</title>
        <meta name="description" content="Menu Pembelajaran Akademik Seleksi Kepolisian" />
      </Head>

      <div className="main-container">
        <div className="card-frame" style={{ height: "850px" }}>
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/dashboard")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">AKADEMIK</h2>
              <div style={{ width: "40px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "24px", marginTop: "8px" }}>
              <h1 className="brand-title">AKADEMIK</h1>
              <p className="brand-subtitle">Pelatihan Keilmuan & Pengetahuan</p>
            </div>

            <div className="menu-list" style={{ gap: "10px" }}>
              <Link href="/akademik/pengetahuan-umum">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  PENGETAHUAN UMUM
                </button>
              </Link>
              
              <Link href="/akademik/wawasan-kebangsaan">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  WAWASAN KEBANGSAAN
                </button>
              </Link>

              <Link href="/akademik/penalaran-numerik">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  PENALARAN NUMERIK
                </button>
              </Link>

              <Link href="/akademik/bahasa-indonesia">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  BAHASA INDONESIA
                </button>
              </Link>

              <Link href="/akademik/bahasa-inggris">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  BAHASA INGGRIS
                </button>
              </Link>
            </div>
          </div>

          <div className="bottom-action-btn" style={{ paddingTop: "16px" }}>
            <Link href="/akademik/history">
              <button className="btn btn-secondary" style={{ padding: "14px" }}>
                HISTORY
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
