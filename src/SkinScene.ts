import Phaser from "phaser";
import { playerData, saveGame } from "./playerData";

export class SkinScene extends Phaser.Scene {
  constructor() {
    super("SkinScene");
  }

  preload() {
    this.load.image("btn", "/btn.png");
    this.load.audio("click", "/click.mp3");
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    this.add
      .text(400, 40, "МАГАЗИН СКИНОВ", {
        fontSize: "32px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(400, 80, "Ваши Яйца: " + playerData.totalEggs, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    let skins = [
      { id: "🏃", name: "Бегун", price: 0 },
      { id: "🥷", name: "Ниндзя", price: 5 },
      { id: "🧙", name: "Маг", price: 15 },
      { id: "🏴‍☠️", name: "Пират", price: 30 },
    ];

    let startY = 150;

    skins.forEach((skin, index) => {
      let y = startY + index * 80;

      this.add.rectangle(400, y, 500, 70, 0x333333).setStrokeStyle(2, 0x555555);
      this.add.text(180, y, skin.id, { fontSize: "40px" }).setOrigin(0.5);
      this.add
        .text(250, y, skin.name, {
          fontSize: "22px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      let isUnlocked = playerData.unlockedSkins.includes(skin.id);
      let isEquipped = playerData.equippedSkin === skin.id;

      if (isEquipped) {
        // Уже надет
        this.add
          .text(550, y, "НАДЕТО", {
            fontSize: "20px",
            color: "#00ff00",
            fontStyle: "bold",
          })
          .setOrigin(0.5);
      } else if (isUnlocked) {
        // Куплен, но не надет - можно просто выбрать
        let btn = this.add
          .image(550, y, "btn")
          .setDisplaySize(150, 40)
          .setInteractive({ useHandCursor: true });
        this.add
          .text(550, y, "ВЫБРАТЬ", { fontSize: "16px", color: "#ffffff" })
          .setOrigin(0.5);
        btn.on("pointerdown", () => {
          playerData.equippedSkin = skin.id;
          saveGame();
          this.scene.restart();
        });
      } else {
        // Не куплен
        let btnText =
          skin.price === 0 ? "БЕСПЛАТНО" : "КУПИТЬ: " + skin.price + " 🥚";
        let btn = this.add
          .image(550, y, "btn")
          .setDisplaySize(150, 40)
          .setInteractive({ useHandCursor: true });
        this.add
          .text(550, y, btnText, { fontSize: "16px", color: "#ffffff" })
          .setOrigin(0.5);

        btn.on("pointerdown", () => {
          if (skin.price === 0 || playerData.totalEggs >= skin.price) {
            playerData.totalEggs -= skin.price;
            playerData.unlockedSkins.push(skin.id); // ДОБАВЛЯЕМ В КУПЛЕННЫЕ
            playerData.equippedSkin = skin.id;
            saveGame();
            this.scene.restart();
          }
        });
      }
    });

    let backBtn = this.add
      .image(400, 520, "btn")
      .setDisplaySize(200, 50)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(400, 520, "НАЗАД", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    backBtn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
