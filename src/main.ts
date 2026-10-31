import { MenuScene } from "./MenuScene";
import Phaser from "phaser";
import { CaveScene } from "./CaveScene";
import { EscapeScene } from "./EscapeScene";
import { ShopScene } from "./ShopScene";
import { loadGame } from "./playerData"; // Импортируем функцию загрузки
import { SkinScene } from "./SkinScene";
// Загружаем прогресс перед запуском!
loadGame();

// ... дальше идет const config и new Phaser.Game(config);

// ==========================================
// НАСТРОЙКА И ЗАПУСК ИГРЫ
// ==========================================
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1a1a1a",
  parent: "app",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Подключаем наши модули
  scene: [MenuScene, ShopScene, SkinScene, CaveScene, EscapeScene],
};

new Phaser.Game(config);
