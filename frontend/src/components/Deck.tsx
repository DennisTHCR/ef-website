import styles from '../styles/components/Deck.module.css';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function Deck() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Deck öffnen</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Dein Deck</DrawerTitle>
          <DrawerDescription>Hier siehst Du all Deine Karten</DrawerDescription>
        </DrawerHeader>
        <div className={styles.deckGrid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={styles.card}></div>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Deck schliessen</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
