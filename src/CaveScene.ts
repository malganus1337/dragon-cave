import Phaser from "phaser";
import { playerData, saveGame } from "./playerData";

export class CaveScene extends Phaser.Scene {
  private indicator!: Phaser.GameObjects.Rectangle;
  private greenZone!: Phaser.GameObjects.Rectangle;
  private player!: Phaser.GameObjects.Text; // Теперь это Текст (эмодзи)
  private dragon!: Phaser.GameObjects.Text; // Теперь это Текст (эмодзи)
  private zzzText!: Phaser.GameObjects.Text;

  private baseMeterSpeed = 200;
  private baseZoneWidth = 45;
  private meterSpeed = 200;
  private indicatorDirection = 1;
  private zoneWidth = 45;

  private gold = 0;
  private anger = 0;
  private steps = 0;
  private maxSteps = 10;
  private isLocked = false;
  private isPaused = false;
  private isTransitioning = false;

  private goldText!: Phaser.GameObjects.Text;
  private angerText!: Phaser.GameObjects.Text;
  private stepsText!: Phaser.GameObjects.Text;

  constructor() {
    super("CaveScene");
  }

  create() {
    this.gold = 0;
    this.anger = 0;
    this.steps = 0;
    this.isLocked = false;
    this.isTransitioning = false;
    this.indicatorDirection = 1;

    this.meterSpeed = this.baseMeterSpeed - playerData.upgradeSpeedLevel * 20;
    if (this.meterSpeed < 100) this.meterSpeed = 100;
    this.zoneWidth = this.baseZoneWidth + playerData.upgradeZoneLevel * 4;

    // ВОР (ниндзя)
    this.player = this.add
      .text(150, 300, playerData.equippedSkin, { fontSize: "50px" })
      .setOrigin(0.5)
      .setFlipX(true);

    // ДРАКОН
    this.dragon = this.add
      .text(650, 300, "🐉", { fontSize: "100px" })
      .setOrigin(0.5);
    this.zzzText = this.add
      .text(650, 210, "Zzz...", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add.rectangle(400, 500, 300, 20, 0x333333);
    this.greenZone = this.add.rectangle(400, 500, this.zoneWidth, 16, 0x00ff00);
    this.indicator = this.add.rectangle(250, 500, 10, 30, 0xffffff);

    this.add
      .text(400, 450, "Нажми ПРОБЕЛ в зелёной зоне", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.goldText = this.add.text(20, 20, "Добыча: 0", {
      fontSize: "24px",
      color: "#ffd700",
    });
    this.angerText = this.add.text(20, 60, "Гнев дракона: 0%", {
      fontSize: "24px",
      color: "#ff4444",
    });
    this.stepsText = this.add.text(20, 100, "Шаги: 0/" + this.maxSteps, {
      fontSize: "24px",
      color: "#ffffff",
    });
    // Кнопка паузы на экране
    let pauseBtn = this.add
      .text(760, 20, "⏸️", { fontSize: "40px" })
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    pauseBtn.on("pointerdown", () => {
      if (!this.isTransitioning && !this.isPaused) {
        this.isPaused = true;
        this.showPauseMenu();
      }
    });

    // Обработка клавиши P для паузы
    this.input.keyboard!.on("keydown-P", () => {
      if (!this.isTransitioning && !this.isPaused) {
        this.isPaused = true;
        this.showPauseMenu();
      }
    });
    this.input.keyboard!.on("keydown-SPACE", () => {
      if (this.isPaused) return;
      if (this.isTransitioning) return;
      if (this.steps >= this.maxSteps) {
        this.scene.start("EscapeScene", { stolenGold: this.gold });
        return;
      }
      if (this.isLocked) return;
      this.checkHit();
    });
    // УПРАВЛЕНИЕ ТАПОМ ДЛЯ МОБИЛОК
    this.input.on("pointerdown", () => {
      if (this.isPaused) return;
      if (this.isTransitioning) return;
      if (this.steps >= this.maxSteps) {
        this.scene.start("EscapeScene", { stolenGold: this.gold });
        return;
      }
      if (this.isLocked) return;
      this.checkHit();
    });
  }

  update(_time: number, delta: number) {
    if (this.isPaused) return;
    if (this.isLocked || this.isTransitioning) return;
    this.indicator.x +=
      this.meterSpeed * this.indicatorDirection * (delta / 1000);

    if (this.indicator.x >= 550) {
      this.indicator.x = 550;
      this.indicatorDirection = -1;
    }
    if (this.indicator.x <= 250) {
      this.indicator.x = 250;
      this.indicatorDirection = 1;
    }
  }
  showPauseMenu() {
    let overlay = this.add
      .rectangle(400, 300, 800, 600, 0x000000, 0.7)
      .setDepth(100);
    let title = this.add
      .text(400, 200, "ПАУЗА", {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100);

    let resumeBtn = this.add
      .rectangle(400, 300, 250, 60, 0x00aa00)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    let resumeTxt = this.add
      .text(400, 300, "ПРОДОЛЖИТЬ", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100);

    let quitBtn = this.add
      .rectangle(400, 400, 250, 60, 0x444444)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    let quitTxt = this.add
      .text(400, 400, "ЗАКОНЧИТЬ", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100);

    resumeBtn.on("pointerdown", () => {
      resumeBtn.disableInteractive();
      resumeBtn.destroy();
      resumeTxt.destroy();
      quitBtn.destroy();
      quitTxt.destroy();
      overlay.destroy();
      title.destroy();

      let countdown = 3;
      let countText = this.add
        .text(400, 300, "3", {
          fontSize: "100px",
          color: "#ffff00",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(100);

      let timer = this.time.addEvent({
        delay: 1000,
        callback: () => {
          countdown--;
          if (countdown > 0) {
            countText.setText(countdown.toString());
          } else {
            countText.destroy();
            timer.destroy();
            this.isPaused = false;
          }
        },
        loop: true,
      });
    });

    quitBtn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
  checkHit() {
    this.isLocked = true;
    const zoneLeft = 400 - this.zoneWidth / 2;
    const zoneRight = 400 + this.zoneWidth / 2;
    const isHit = this.indicator.x >= zoneLeft && this.indicator.x <= zoneRight;

    this.steps++;
    this.stepsText.setText("Шаги: " + this.steps + "/" + this.maxSteps);

    if (isHit) {
      this.gold += this.steps * 10;
      this.goldText.setText("Добыча: " + this.gold);
      this.cameras.main.flash(100, 0, 255, 0);

      // Анимация шага ниндзя
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 40,
        duration: 200,
        ease: "Power2",
      });

      this.meterSpeed += 40;
      this.zoneWidth = Math.max(15, this.zoneWidth - 5);
      this.greenZone.width = this.zoneWidth;
      this.greenZone.setSize(this.zoneWidth, 16);
    } else {
      this.anger += 25;
      this.angerText.setText(
        "Гнев дракона: " + Math.floor(this.anger / 2) + "%",
      );
      this.cameras.main.shake(200, 0.02);

      // Дракон дергается
      this.tweens.add({
        targets: this.dragon,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 1,
      });
    }

    if (this.anger >= 200) {
      this.panicEscape();
      return;
    }
    if (this.steps >= this.maxSteps) {
      this.reachNest();
      return;
    }

    this.time.delayedCall(400, () => {
      this.isLocked = false;
      this.indicator.x = 250;
      this.indicatorDirection = 1;
    });
  }

  panicEscape() {
    this.isTransitioning = true;
    this.zzzText.setText("RAAAR!");
    this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.4);
    this.add
      .text(400, 200, "Дракон проснулся!", {
        fontSize: "40px",
        color: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    if (this.gold > 0) {
      this.add
        .text(400, 260, "Вы хватаете золото и бежите!", {
          fontSize: "24px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      this.time.delayedCall(1500, () => {
        this.scene.start("EscapeScene", { stolenGold: this.gold });
      });
    } else {
      let penalty = playerData.currentCaveLevel * 50;
      playerData.totalGold = Math.max(0, playerData.totalGold - penalty);
      saveGame();
      this.add
        .text(400, 260, `Вы в панике сбежали и потеряли ${penalty} золота!`, {
          fontSize: "24px",
          color: "#ff4444",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.time.delayedCall(2500, () => {
        this.scene.start("ShopScene");
      });
    }
  }

  reachNest() {
    this.isLocked = true;
    this.add.rectangle(400, 300, 800, 600, 0x00ff00, 0.3);
    this.add
      .text(400, 200, "Вы дошли до гнезда!", {
        fontSize: "40px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    playerData.runsCompleted += 1;
    let eggMessage = "";

    // Выдаем яйцо только каждый 5-й раз
    if (playerData.runsCompleted % 5 === 0) {
      playerData.totalEggs += 1;
      eggMessage = "Вы украли Яйцо! (Всего: " + playerData.totalEggs + ")";
    } else {
      eggMessage =
        "Гнездо пустое (Яйцо будет через " +
        (5 - (playerData.runsCompleted % 5)) +
        " забегов)";
    }
    saveGame();

    this.add
      .text(400, 260, eggMessage, { fontSize: "24px", color: "#ffffff" })
      .setOrigin(0.5);
    this.add
      .text(400, 320, "Нажми ПРОБЕЛ, чтобы начать побег!", {
        fontSize: "20px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }
}
