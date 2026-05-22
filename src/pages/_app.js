import '@/styles/globals.css';
import '../styles/styles.css';

export default function App({ Component, pageProps }) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="site-header__brand">GameStats</div>
        <p className="site-header__tagline">Dota 2 match outlier analysis</p>
      </header>
      <main className="page-main">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
