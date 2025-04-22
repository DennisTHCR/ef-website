import styles from '../styles/components/Deck.module.css';

export default function Deck() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">Your Deck</h2>
      <div className={styles.deckGrid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.card}></div>
        ))}
      </div>
    </section>
  );
}