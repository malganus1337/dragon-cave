import Phaser from "phaser";
import { playerData, saveGame } from "./playerData";

export class EscapeScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Text;
  private shieldSprite!: Phaser.GameObjects.Text;
  private dragonSprite!: Phaser.GameObjects.Text;
  private obstacles: Phaser.GameObjects.Text[] = [];
  private coins: Phaser.GameObjects.Text[] = [];

  private bgRect!: Phaser.GameObjects.Rectangle;
  private floorRect!: Phaser.GameObjects.Rectangle;
  private currentBiome = 1;

  private velocityY = 0;
  private gravity = 4500; // Усиленная гравитация для быстрого приземления
  private jumpForce = -1100; // Резкий прыжок
  private isJumping = false;

  private isSliding = false;
  private slideTimer = 0;

  private isUnderAttack = false;
  private isHiding = false;
  private canShield = false; // Разрешение на щит только во время атаки
  private attackTimer = 0;

  private warningText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text; // Подсказка под иконкой
  private fireEffect!: Phaser.GameObjects.Text;

  private shieldActiveTime = 0;

  private gameSpeed = 400;
  private spawnTimer = 0;

  private isGameOver = false;
  private isPaused = false;

  private health = 3;
  private maxHealth = 3;
  private isInvulnerable = false;
  private heartsText!: Phaser.GameObjects.Text;

  private distance = 0;
  private distanceText!: Phaser.GameObjects.Text;

  private stolenGold = 0;
  private deathGroup: Phaser.GameObjects.GameObject[] = [];

  private startY = 0;
  private startTime = 0;

  constructor() {
    super("EscapeScene");
  }

  init(data: { stolenGold: number }) {
    this.stolenGold = data.stolenGold || 0;
  }

  create() {
    this.isGameOver = false;
    this.isPaused = false;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isUnderAttack = false;
    this.isHiding = false;
    this.canShield = false;
    this.shieldActiveTime = 0;
    this.obstacles = [];
    this.coins = [];
    this.deathGroup = [];
    this.distance = 0;
    this.spawnTimer = 0;
    this.attackTimer = 0;
    this.currentBiome = 1;

    this.gameSpeed = 400 + playerData.currentCaveLevel * 50;
    this.maxHealth = playerData.hasAchillesShield ? 6 : 3;
    this.health = this.maxHealth;

    let bgColor = 0x1a1a1a;
    let floorColor = 0x2d2d2d;

    if (playerData.currentCaveLevel === 2) {
      bgColor = 0x330000;
      floorColor = 0x550000;
    } else if (playerData.currentCaveLevel === 3) {
      bgColor = 0x001133;
      floorColor = 0x002255;
    } else if (playerData.currentCaveLevel >= 4) {
      bgColor = 0x1a0033;
      floorColor = 0x2d0055;
    }

    this.bgRect = this.add.rectangle(400, 300, 800, 600, bgColor);
    this.floorRect = this.add.rectangle(400, 520, 800, 160, floorColor);

    this.player = this.add
      .text(200, 450, playerData.equippedSkin, { fontSize: "50px" })
      .setOrigin(0.5)
      .setFlipX(true)
      .setDepth(2);
    this.shieldSprite = this.add
      .text(200, 410, "🛡️", { fontSize: "40px" })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(3);
    this.dragonSprite = this.add
      .text(50, 250, "🐉", { fontSize: "80px" })
      .setOrigin(0.5)
      .setFlipX(true);

    this.add.text(20, 20, "Добыча: " + this.stolenGold, {
      fontSize: "24px",
      color: "#ffd700",
    });
    this.heartsText = this.add.text(
      20,
      60,
      "Жизни: " + "❤️".repeat(this.health),
      { fontSize: "24px", color: "#ff0000" },
    );

    this.distanceText = this.add
      .text(400, 30, "Дистанция: 0 м", {
        fontSize: "28px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Визуальные предупреждения (большие иконки вместо текста)
    this.warningText = this.add
      .text(400, 200, "", { fontSize: "100px" })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10);
    this.hintText = this.add
      .text(400, 300, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(10);
    this.fireEffect = this.add
      .text(500, 450, "🔥", { fontSize: "100px" })
      .setOrigin(0.5)
      .setVisible(false);

    // --- УПРАВЛЕНИЕ СВАЙПАМИ ---
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.startY = pointer.y;
      this.startTime = this.time.now;
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || this.isPaused) return;

      let diffY = this.startY - pointer.y;
      let timeDiff = this.time.now - this.startTime;

      if (timeDiff < 300 && Math.abs(diffY) > 50) {
        if (diffY > 0) {
          if (!this.isJumping && !this.isSliding) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
          }
        } else {
          if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 700;
            this.player.setScale(1, 0.5);
            this.player.y = 465;
          }
        }
      } else if (timeDiff < 300 && Math.abs(diffY) <= 50) {
        // ТАП - Щит (работает только если сейчас идет огненная атака!)
        if (this.canShield) this.raiseShield();
      }
    });

    // --- УПРАВЛЕНИЕ ДЛЯ ПК ---
    this.input.keyboard!.on("keydown-P", () => {
      if (!this.isGameOver && !this.isPaused) {
        this.isPaused = true;
        this.showPauseMenu();
      }
    });

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      if (this.isGameOver || this.isPaused) {
        if (this.isGameOver) {
          if (event.code === "KeyY") this.resurrectWithAd();
          else if (event.code === "KeyN" || event.code === "Space")
            this.surrender();
        }
        return;
      }

      if (event.code === "ArrowUp" || event.code === "KeyW") {
        if (!this.isJumping && !this.isSliding) {
          this.velocityY = this.jumpForce;
          this.isJumping = true;
        }
      }
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        if (!this.isJumping && !this.isSliding) {
          this.isSliding = true;
          this.slideTimer = 700;
          this.player.setScale(1, 0.5);
          this.player.y = 465;
        }
      }
      if (event.code === "Space") {
        if (this.canShield) this.raiseShield();
      }
    });
  }

  update(_time: number, delta: number) {
    if (this.isPaused || this.isGameOver) return;

    if (this.shieldActiveTime > 0) {
      this.shieldActiveTime -= delta;
      if (this.shieldActiveTime <= 0) {
        this.isHiding = false;
        this.shieldSprite.setVisible(false);
        this.player.alpha = 1;
      }
    }

    this.attackTimer += delta;
    if (
      this.attackTimer > 10000 &&
      !this.isUnderAttack &&
      this.obstacles.length === 0
    ) {
      this.attackTimer = 0;
      this.startDragonAttack();
    }

    this.gameSpeed += 0.5 * (delta / 1000);
    this.distance += this.gameSpeed * 0.1 * (delta / 1000);
    this.distanceText.setText("Дистанция: " + Math.floor(this.distance) + " м");

    let newBiome = Math.floor(this.distance / 1000) + 1;
    if (newBiome !== this.currentBiome && newBiome <= 4) {
      this.currentBiome = newBiome;
      if (this.currentBiome === 2) {
        this.bgRect.setFillStyle(0x330000);
        this.floorRect.setFillStyle(0x550000);
        this.dragonSprite.setText("🐉");
      } else if (this.currentBiome === 3) {
        this.bgRect.setFillStyle(0x001133);
        this.floorRect.setFillStyle(0x002255);
        this.dragonSprite.setText("🐲");
      } else if (this.currentBiome === 4) {
        this.bgRect.setFillStyle(0x0a0a0a);
        this.floorRect.setFillStyle(0x1a1a1a);
        this.dragonSprite.setText("🐍");
      }
    }

    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.player.setScale(1, 1);
        this.player.y = 450;
      }
    }

    if (this.isJumping) {
      this.player.y += this.velocityY * (delta / 1000);
      this.velocityY += this.gravity * (delta / 1000);
      if (this.player.y >= 450) {
        this.player.y = 450;
        this.isJumping = false;
        this.velocityY = 0;
      }
    }

    if (this.shieldSprite.visible) {
      this.shieldSprite.x = this.player.x;
      this.shieldSprite.y = this.player.y - 40;
    }

    if (!this.isUnderAttack) {
      this.spawnTimer += delta;
      if (this.spawnTimer > 1500) {
        this.spawnTimer = 0;
        let type = Phaser.Math.Between(1, 3);
        if (type === 1) {
          let rock = this.add
            .text(850, 460, "🧱", { fontSize: "40px" })
            .setOrigin(0.5);
          this.obstacles.push(rock);
          this.time.delayedCall(400, () => {
            this.coins.push(
              this.add
                .text(850, 380, "💰", { fontSize: "30px" })
                .setOrigin(0.5),
            );
          });
        } else if (type === 2) {
          let bat = this.add
            .text(850, 380, "🦇\n🦇\n🦇", { fontSize: "40px", align: "center" })
            .setOrigin(0.5);
          bat.setData("isBat", true);
          this.obstacles.push(bat);
          this.time.delayedCall(400, () => {
            this.coins.push(
              this.add
                .text(850, 460, "💰", { fontSize: "30px" })
                .setOrigin(0.5),
            );
          });
        } else {
          for (let i = 0; i < 3; i++) {
            this.coins.push(
              this.add
                .text(850 + i * 50, 450, "💰", { fontSize: "30px" })
                .setOrigin(0.5),
            );
          }
        }
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      let obs = this.obstacles[i];
      obs.x -= this.gameSpeed * (delta / 1000);
      if (obs.x < -50) {
        obs.destroy();
        this.obstacles.splice(i, 1);
        continue;
      }
      if (obs.getData("isBat")) {
        let batHitbox = new Phaser.Geom.Rectangle(obs.x - 30, 100, 60, 345);
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.player.getBounds(),
            batHitbox,
          )
        )
          this.takeDamage(obs, 1);
      } else {
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.player.getBounds(),
            obs.getBounds(),
          )
        )
          this.takeDamage(obs, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      let coin = this.coins[i];
      coin.x -= this.gameSpeed * (delta / 1000);
      if (coin.x < -50) {
        coin.destroy();
        this.coins.splice(i, 1);
      }
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          coin.getBounds(),
        )
      ) {
        this.stolenGold += 10;
        this.children.each((child) => {
          if (
            child instanceof Phaser.GameObjects.Text &&
            child.text.startsWith("Добыча:")
          )
            child.setText("Добыча: " + this.stolenGold);
        });
        coin.destroy();
        this.coins.splice(i, 1);
      }
    }
  }

  startDragonAttack() {
    this.isUnderAttack = true;
    let attackType = Phaser.Math.Between(1, 3);

    this.warningText
      .setVisible(true)
      .setScale(0.5)
      .setAlpha(1)
      .setColor("#ffffff");
    this.hintText.setVisible(true).setAlpha(1).setColor("#ffffff");

    if (attackType === 1) {
      this.canShield = true;
      this.warningText.setText("🔥");
      this.hintText.setText("ТАП / ПРОБЕЛ");

      this.tweens.add({
        targets: this.warningText,
        scale: 1.5,
        duration: 1500,
      });

      this.time.delayedCall(1500, () => {
        this.hintText.setText("ЖМИ СЕЙЧАС!").setColor("#ff0000");
        this.cameras.main.shake(200, 0.02);

        this.time.delayedCall(400, () => {
          this.fireEffect
            .setPosition(this.player.x, 350)
            .setVisible(true)
            .setDepth(3);
          this.cameras.main.shake(300, 0.05);
          if (!this.isHiding) this.takeDamage(null, 2);

          this.time.delayedCall(500, () => {
            this.fireEffect.setVisible(false);
            this.isUnderAttack = false;
            this.canShield = false;
            this.warningText.setVisible(false);
            this.hintText.setVisible(false);
          });
        });
      });
    } else if (attackType === 2) {
      this.warningText.setText("⬇️");
      this.hintText.setText("СВАЙП ВНИЗ");

      this.tweens.add({
        targets: this.warningText,
        scale: 1.5,
        duration: 1500,
      });
      this.tweens.add({ targets: this.dragonSprite, y: 380, duration: 1200 });

      this.time.delayedCall(1500, () => {
        this.hintText.setText("СЕЙЧАС!").setColor("#ff0000");
        this.cameras.main.shake(200, 0.02);

        this.time.delayedCall(400, () => {
          this.tweens.add({
            targets: this.dragonSprite,
            x: 200,
            yoyo: true,
            duration: 200,
          });
          this.cameras.main.shake(300, 0.05);
          if (!this.isSliding) this.takeDamage(null, 2);

          this.time.delayedCall(500, () => {
            this.isUnderAttack = false;
            this.warningText.setVisible(false);
            this.hintText.setVisible(false);
            this.tweens.add({
              targets: this.dragonSprite,
              x: 50,
              y: 250,
              duration: 500,
            });
          });
        });
      });
    } else {
      this.warningText.setText("⬆️");
      this.hintText.setText("СВАЙП ВВЕРХ");

      this.tweens.add({
        targets: this.warningText,
        scale: 1.5,
        duration: 1500,
      });

      this.time.delayedCall(1500, () => {
        this.hintText.setText("СЕЙЧАС!").setColor("#ff0000");
        this.cameras.main.shake(200, 0.02);

        this.time.delayedCall(400, () => {
          this.cameras.main.shake(400, 0.08);
          if (!this.isJumping) this.takeDamage(null, 2);

          this.time.delayedCall(500, () => {
            this.isUnderAttack = false;
            this.warningText.setVisible(false);
            this.hintText.setVisible(false);
          });
        });
      });
    }
  }

  raiseShield() {
    this.isHiding = true;
    this.shieldActiveTime = 1500;
    this.shieldSprite.setVisible(true);
    this.player.alpha = 0.8;
    this.hintText.setText("ЩИТ ПОДНЯТ!").setColor("#00ffff");
  }

  takeDamage(obstacle: Phaser.GameObjects.Text | null, damageAmount: number) {
    if (this.isInvulnerable) return;
    this.health -= damageAmount;

    let hearts = "";
    for (let i = 0; i < this.health; i++) hearts += "❤️";
    for (let i = this.health; i < this.maxHealth; i++) hearts += "🖤";
    this.heartsText.setText("Жизни: " + hearts);

    this.cameras.main.shake(200, 0.02);
    this.cameras.main.flash(200, 255, 0, 0);

    if (obstacle) obstacle.destroy();

    if (this.health <= 0) {
      if (playerData.hasAegis) {
        playerData.hasAegis = false;
        saveGame();
        this.health = playerData.hasAchillesShield ? 6 : 3;
        this.heartsText.setText("Жизни: " + "❤️".repeat(this.health));
        this.cameras.main.flash(500, 0, 255, 255);
        this.add
          .text(400, 300, "ЭГИДА СПАСЛА ВАС!", {
            fontSize: "30px",
            color: "#00ffff",
            fontStyle: "bold",
          })
          .setOrigin(0.5);
        this.time.delayedCall(1500, () => {
          this.children.each((child) => {
            if (
              child instanceof Phaser.GameObjects.Text &&
              child.text === "ЭГИДА СПАСЛА ВАС!"
            )
              child.destroy();
          });
        });
        return;
      }
      this.showDeathScreen();
      return;
    }

    this.isInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 150,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        if (!this.isHiding) this.player.alpha = 1;
        this.isInvulnerable = false;
      },
    });
  }

  showDeathScreen() {
    this.isGameOver = true;
    let finalGold = this.stolenGold;
    if (playerData.hasMidasHand) {
      finalGold = Math.floor(finalGold * 2);
      playerData.hasMidasHand = false;
    }
    playerData.totalGold += finalGold;
    saveGame();

    let bg = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.5);
    let t1 = this.add
      .text(400, 150, "Вас поймали!", {
        fontSize: "40px",
        color: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    let t2 = this.add
      .text(400, 200, "Вы пробежали: " + Math.floor(this.distance) + " м", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    let t3 = this.add
      .text(400, 240, "Добыча сохранена: +" + finalGold + " золота", {
        fontSize: "24px",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    let adBtn = this.add
      .rectangle(400, 340, 300, 60, 0x00aa00)
      .setInteractive({ useHandCursor: true });
    let adTxt = this.add
      .text(400, 340, "ПРОДОЛЖИТЬ (Реклама)", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    adBtn.on("pointerdown", () => {
      this.resurrectWithAd();
    });

    let quitBtn = this.add
      .rectangle(400, 430, 300, 60, 0x444444)
      .setInteractive({ useHandCursor: true });
    let quitTxt = this.add
      .text(400, 430, "НА БАЗУ", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    quitBtn.on("pointerdown", () => {
      this.scene.start("ShopScene");
    });

    this.deathGroup = [bg, t1, t2, t3, adBtn, adTxt, quitBtn, quitTxt];
  }

  resurrectWithAd() {
    this.deathGroup.forEach((obj) => obj.destroy());
    this.deathGroup = [];
    this.isGameOver = false;
    this.isUnderAttack = false;
    this.isHiding = false;
    this.health = playerData.hasAchillesShield ? 6 : 3;
    this.heartsText.setText("Жизни: " + "❤️".repeat(this.health));
    this.player.x = 200;
    this.player.y = 450;
    this.player.setScale(1, 1);
    this.player.alpha = 1;
    this.player.setDepth(2);
    this.isJumping = false;
    this.isSliding = false;
    this.velocityY = 0;
    this.fireEffect.setVisible(false);
    this.shieldSprite.setVisible(false);
    this.attackTimer = 0;
    this.canShield = false;
    this.shieldActiveTime = 0;

    this.isInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 200,
      yoyo: true,
      repeat: 9,
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvulnerable = false;
      },
    });
  }

  surrender() {
    this.scene.start("ShopScene");
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
          if (countdown > 0) countText.setText(countdown.toString());
          else {
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
}
