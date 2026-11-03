import Phaser from "phaser";
import { playerData } from "./playerData";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("btn", "/btn.png");
    this.load.audio("click", "/click.mp3");
  }

  create() {
    // Фон пещеры
    this.add.rectangle(400, 300, 800, 600, 0x1a1a1a);
    this.add
      .text(400, 80, "ПЕЩЕРА ДРАКОНА", {
        fontSize: "40px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Золото и Яйца
    this.add
      .text(
        20,
        20,
        "💰 " + playerData.totalGold + "   🥚 " + playerData.totalEggs,
        { fontSize: "24px", color: "#ffffff" },
      )
      .setOrigin(0, 0.5);

    // Герой (Скин)
    this.add
      .text(400, 220, playerData.equippedSkin, { fontSize: "100px" })
      .setOrigin(0.5);

    // --- КНОПКИ ПО БОКАМ ---
    // Слева: Магазин
    let shopBtn = this.add
      .text(80, 250, "🛒", { fontSize: "60px" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(80, 300, "МАГАЗИН", { fontSize: "16px", color: "#aaaaaa" })
      .setOrigin(0.5);
    shopBtn.on("pointerdown", () => {
      this.scene.start("ShopScene");
    });

    // Справа: Скины
    let skinBtn = this.add
      .text(720, 250, "👕", { fontSize: "60px" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(720, 300, "СКИНЫ", { fontSize: "16px", color: "#aaaaaa" })
      .setOrigin(0.5);
    skinBtn.on("pointerdown", () => {
      this.scene.start("SkinScene");
    });

    // --- БОЛЬШАЯ КНОПКА ВХОДА ---
    let playBtnBg = this.add
      .image(400, 380, "btn")
      .setDisplaySize(300, 70)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(400, 380, "ВОЙТИ В ПЕЩЕРУ", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    playBtnBg.on("pointerover", () => playBtnBg.setTint(0xdddddd));
    playBtnBg.on("pointerout", () => playBtnBg.clearTint());

    playBtnBg.on("pointerdown", () => {
      let blackout = this.add
        .rectangle(400, 300, 800, 600, 0x000000, 0)
        .setDepth(10);
      this.tweens.add({
        targets: blackout,
        alpha: 1,
        duration: 400,
        onComplete: () => {
          this.scene.start("EscapeScene", { stolenGold: 0 });
        },
      });
    });

    // --- НИЖНИЕ КНОПКИ ---
    // Туториал
    let tutBtn = this.add
      .text(200, 500, "📖 КАК ИГРАТЬ", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    tutBtn.on("pointerdown", () => {
      tutBtn.disableInteractive(); // Отключаем кнопку

      let tutBg = this.add
        .rectangle(400, 300, 700, 500, 0x000000, 0.9)
        .setDepth(50)
        .setInteractive();
      let isMobile = this.sys.game.device.input.touch;
      let tutContent = isMobile
        ? "УПРАВЛЕНИЕ (Телефон):\n\n" +
          "⬆️ СВАЙП ВВЕРХ - Прыжок\n" +
          "⬇️ СВАЙП ВНИЗ - Подкат\n" +
          "🛡️ ТАП ПО ЭКРАНУ - Щит (во время атаки огнем)\n\n" +
          "Следи за подсказками:\n" +
          "🔥 - Жми щит\n" +
          "⬇️ - Делай подкат\n" +
          "⬆️ - Прыгай\n\n" +
          "Собирай золото 💰!"
        : "УПРАВЛЕНИЕ (ПК):\n\n" +
          "⬆️ СТРЕЛКА ВВЕРХ - Прыжок\n" +
          "⬇️ СТРЕЛКА ВНИЗ - Подкат\n" +
          "🛡️ ПРОБЕЛ - Щит (во время атаки огнем)\n\n" +
          "Следи за подсказками:\n" +
          "🔥 - Жми щит\n" +
          "⬇️ - Делай подкат\n" +
          "⬆️ - Прыгай\n\n" +
          "Собирай золото 💰!";

      let tutText = this.add
        .text(
          400,
          300,
          tutContent,
          {
            fontSize: "20px",
            color: "#ffffff",
            align: "center",
            lineSpacing: 10,
          },
        )
        .setOrigin(0.5)
        .setDepth(50);

      tutBg.on("pointerdown", () => {
        tutBg.destroy();
        tutText.destroy();
        tutBtn.setInteractive(); // Включаем кнопку обратно
      });
    });

    // Титры
    let creditsBtn = this.add
      .text(400, 500, "📜 ТИТРЫ", { fontSize: "20px", color: "#aaaaaa" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    creditsBtn.on("pointerdown", () => {
      creditsBtn.disableInteractive(); // Отключаем кнопку, пока открыто окно

      let credBg = this.add
        .rectangle(400, 300, 700, 400, 0x000000, 0.9)
        .setDepth(50)
        .setInteractive();
      let credText = this.add
        .text(
          400,
          300,
          "СОЗДАТЕЛИ:\n\nИдея: ТЫ\nКод: Нейросеть\nДвижок: Phaser 3\n\nНажми, чтобы закрыть",
          {
            fontSize: "24px",
            color: "#ffffff",
            align: "center",
            lineSpacing: 10,
          },
        )
        .setOrigin(0.5)
        .setDepth(50);

      credBg.on("pointerdown", () => {
        credBg.destroy();
        credText.destroy();
        creditsBtn.setInteractive(); // Включаем кнопку обратно, когда окно закрыто
      });
    });
  }
}
