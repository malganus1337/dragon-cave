import Phaser from "phaser";
import { playerData, saveGame } from "./playerData";

export class ShopScene extends Phaser.Scene {
  private isSpinning = false;

  constructor() {
    super("ShopScene");
  }

  preload() {
    this.load.image("btn", "/btn.png");
    this.load.audio("click", "/click.mp3");
  }

  create() {
    this.isSpinning = false;
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    this.add
      .text(400, 40, "МАГАЗИН УЛУЧШЕНИЙ", {
        fontSize: "32px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(
        400,
        80,
        "Золото: " + playerData.totalGold + " | Яйца: " + playerData.totalEggs,
        { fontSize: "20px", color: "#ffd700" },
      )
      .setOrigin(0.5);

    // Кнопки покупки
    this.createButton(
      400,
      160,
      "Скорость шагов",
      "Ур. " + playerData.upgradeSpeedLevel,
      200,
      () => {
        let cost = 100 + playerData.upgradeSpeedLevel * 50;
        if (playerData.totalGold >= cost && playerData.upgradeSpeedLevel < 3) {
          playerData.totalGold -= cost;
          playerData.upgradeSpeedLevel++;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      215,
      "Тихие шаги (Зона)",
      "Ур. " + playerData.upgradeZoneLevel,
      200,
      () => {
        let cost = 100 + playerData.upgradeZoneLevel * 50;
        if (playerData.totalGold >= cost && playerData.upgradeZoneLevel < 3) {
          playerData.totalGold -= cost;
          playerData.upgradeZoneLevel++;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      270,
      "Сапоги Гермеса",
      playerData.hermesBootsActive ? "КУПЛЕНО" : "Цена: 800",
      200,
      () => {
        if (playerData.totalGold >= 800 && !playerData.hermesBootsActive) {
          playerData.totalGold -= 800;
          playerData.hermesBootsActive = true;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      325,
      "Рука Мидаса (x2)",
      playerData.hasMidasHand ? "КУПЛЕНО" : "Цена: 800",
      200,
      () => {
        if (playerData.totalGold >= 800 && !playerData.hasMidasHand) {
          playerData.totalGold -= 800;
          playerData.hasMidasHand = true;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      380,
      "Щит Ахилла (+3 HP)",
      playerData.hasAchillesShield ? "КУПЛЕНО" : "Цена: 5000",
      200,
      () => {
        if (playerData.totalGold >= 5000 && !playerData.hasAchillesShield) {
          playerData.totalGold -= 5000;
          playerData.hasAchillesShield = true;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      435,
      "Эгида (Воскрешение)",
      playerData.hasAegis ? "КУПЛЕНО" : "Цена: 10000",
      200,
      () => {
        if (playerData.totalGold >= 10000 && !playerData.hasAegis) {
          playerData.totalGold -= 10000;
          playerData.hasAegis = true;
          saveGame();
          this.scene.restart();
        }
      },
    );

    this.createButton(
      400,
      490,
      "Сундук удачи (Золото)",
      "Цена: 1200",
      200,
      () => {
        if (playerData.totalGold >= 1200 && !this.isSpinning) {
          playerData.totalGold -= 1200;
          this.openLootBoxRoulette();
        }
      },
    );

    this.createButton(
      400,
      545,
      "Сундук удачи (Яйца)",
      "Цена: 5 яиц",
      200,
      () => {
        if (playerData.totalEggs >= 5 && !this.isSpinning) {
          playerData.totalEggs -= 5;
          this.openLootBoxRoulette();
        }
      },
    );

    // Кнопка НАЗАД
    this.createButton(400, 605, "НАЗАД", "В главное меню", 250, () => {
      this.scene.start("MenuScene");
    });
  }

  getCaveName(level: number): string {
    if (level === 1) return "Пещера 1: Логово ящериц";
    if (level === 2) return "Пещера 2: Огненный дракон";
    if (level === 3) return "Пещера 3: Ледяной дракон";
    if (level >= 4) return "Пещера " + level + ": Королевство драконов";
    return "Пещера " + level;
  }

  openLootBoxRoulette() {
    this.isSpinning = true;
    let roll = Math.random();
    let winType = "";
    // Теперь падают только рука и сапоги (эгида и щит слишком дорогие для рандома)
    if (roll < 0.5) {
      playerData.hermesBootsActive = true;
      winType = "Сапоги";
    } else {
      playerData.hasMidasHand = true;
      winType = "Рука";
    }
    saveGame();

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    let title = this.add
      .text(400, 100, "КРУТИМ СУНДУК...", {
        fontSize: "32px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    let container = this.add.container(400, 300);
    let items = [
      "Сапоги",
      "Рука",
      "Сапоги",
      "Рука",
      "Сапоги",
      "Рука",
      "Сапоги",
      "Рука",
      "Сапоги",
      "Рука",
    ];

    for (let i = 0; i < items.length; i++) {
      let bg = this.add
        .rectangle(i * 120, 0, 110, 100, 0x333333)
        .setStrokeStyle(2, 0xffd700);
      let txt = this.add
        .text(i * 120, 0, items[i], { fontSize: "18px", color: "#ffffff" })
        .setOrigin(0.5);
      container.add([bg, txt]);
    }

    this.add
      .triangle(400, 300, 0, 0, 20, 0, 10, 20, 0xff0000)
      .setOrigin(0.5)
      .setDepth(10);

    let itemIndex = items.indexOf(winType) + 4;
    let targetX = -(itemIndex * 120);
    targetX -= Phaser.Math.Between(-30, 30);

    this.tweens.add({
      targets: container,
      x: { from: 400, to: 400 + targetX },
      duration: 3000,
      ease: "Cubic.easeOut",
      onComplete: () => {
        title.setText("ВЫ ВЫБИЛИ: " + winType + "!");
        this.add
          .text(400, 450, "Нажмите мышкой в любом месте, чтобы продолжить", {
            fontSize: "20px",
            color: "#aaaaaa",
          })
          .setOrigin(0.5);
        this.input.once("pointerdown", () => {
          this.scene.restart();
        });
      },
    });
  }

  createButton(
    x: number,
    y: number,
    title: string,
    subtitle: string,
    width: number,
    callback: () => void,
  ) {
    let bg = this.add
      .image(x, y, "btn")
      .setDisplaySize(width, 38)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y - 8, title, {
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(x, y + 10, subtitle, { fontSize: "13px", color: "#aaaaaa" })
      .setOrigin(0.5);

    bg.on("pointerdown", callback);
    bg.on("pointerover", () => bg.setTint(0xdddddd));
    bg.on("pointerout", () => bg.clearTint());
  }
}
