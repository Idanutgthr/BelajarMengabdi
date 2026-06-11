import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function PsikotesMenu() {
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
        <title>Psikotes - BelajarMengabdi</title>
        <meta name="description" content="Menu Pembelajaran Psikotes Seleksi Kepolisian" />
      </Head>

      <div className="main-container">
        <div className="card-frame">
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/dashboard")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">PSIKOTES</h2>
              <div style={{ width: "40px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "32px", marginTop: "16px" }}>
              <h1 className="brand-title">PSIKOTES</h1>
              <p className="brand-subtitle">Pelatihan Mental & Kecerdasan</p>
            </div>

            <div className="menu-list" style={{ gap: "16px" }}>
              <Link href="/psikotes/kecerdasan">
                <button className="btn btn-menu" style={{ padding: "18px" }}>
                  KECERDASAN
                </button>
              </Link>
              
              <Link href="/psikotes/kepribadian">
                <button className="btn btn-menu" style={{ padding: "18px" }}>
                  KEPRIBADIAN
                </button>
              </Link>

              <Link href="/psikotes/sikap-kerja">
                <button className="btn btn-menu" style={{ padding: "18px" }}>
                  SIKAP KERJA
                </button>
              </Link>
            </div>
          </div>

          <div className="bottom-action-btn">
            <Link href="/psikotes/history">
              <button className="btn btn-secondary" style={{ padding: "16px" }}>
                HISTORY
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
