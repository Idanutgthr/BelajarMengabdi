import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function JasmaniMenu() {
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
        <title>Jasmani - BelajarMengabdi</title>
        <meta name="description" content="Menu Pembelajaran Fisik Jasmani Seleksi Kepolisian" />
      </Head>

      <div className="main-container">
        <div className="card-frame" style={{ height: "850px" }}>
          <div>
            <div className="top-bar-nav">
              <button onClick={() => router.push("/dashboard")} className="btn-back-round">
                ←
              </button>
              <h2 className="screen-title">JASMANI</h2>
              <div style={{ width: "40px" }}></div>
            </div>

            <div className="header-brand" style={{ marginBottom: "24px", marginTop: "8px" }}>
              <h1 className="brand-title">JASMANI</h1>
              <p className="brand-subtitle">Simulasi Kesamaptaan Jasmani</p>
            </div>

            <div className="menu-list" style={{ gap: "10px" }}>
              <Link href="/jasmani/lari">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  LARI (12 MENIT)
                </button>
              </Link>
              
              <Link href="/jasmani/push-up">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  PUSH UP (1 MENIT)
                </button>
              </Link>

              <Link href="/jasmani/sit-up">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  SIT UP (1 MENIT)
                </button>
              </Link>

              <Link href="/jasmani/pull-up">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  PULL UP / CHINNING
                </button>
              </Link>

              <Link href="/jasmani/shuttle-run">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px" }}>
                  SHUTTLE RUN
                </button>
              </Link>

              <Link href="/jasmani/kalkulator-gabungan">
                <button className="btn btn-menu" style={{ padding: "14px", fontSize: "14px", backgroundColor: "var(--bg-login-btn)", color: "white" }}>
                  KALKULATOR GABUNGAN
                </button>
              </Link>
            </div>
          </div>

          <div className="bottom-action-btn" style={{ paddingTop: "16px" }}>
            <Link href="/jasmani/history">
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
