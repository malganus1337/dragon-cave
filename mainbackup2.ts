import Phaser from 'phaser';

// Глобальное хранилище (наша "база данных")
let playerData = {
    totalGold: 0,
    upgradeSpeedLevel: 0,
    upgradeZoneLevel: 0
};

// ==========================================
// СЦЕНА 1: ПЕЩЕРА (Стелс)
// ==========================================
class CaveScene extends Phaser.Scene {
    private indicator!: Phaser.GameObjects.Rectangle;
    private greenZone!: Phaser.GameObjects.Rectangle;
    private player!: Phaser.GameObjects.Rectangle;
    private dragon!: Phaser.GameObjects.Rectangle;
    private zzzText!: Phaser.GameObjects.Text;
    
    private baseMeterSpeed = 200;
    private baseZoneWidth = 60;
    private meterSpeed = 200;
    private indicatorDirection = 1;
    private zoneWidth = 60;
    
    private gold = 0;
    private anger = 0;
    private steps = 0;
    private maxSteps = 10;
    private isLocked = false; 
    private isTransitioning = false; 

    private goldText!: Phaser.GameObjects.Text;
    private angerText!: Phaser.GameObjects.Text;
    private stepsText!: Phaser.GameObjects.Text;

    constructor() {
        super('CaveScene');
    }

    create() {
        this.gold = 0;
        this.anger = 0;
        this.steps = 0;
        this.isLocked = false;
        this.isTransitioning = false;
        this.indicatorDirection = 1;

        this.meterSpeed = this.baseMeterSpeed - (playerData.upgradeSpeedLevel * 20);
        if (this.meterSpeed < 100) this.meterSpeed = 100;
        this.zoneWidth = this.baseZoneWidth + (playerData.upgradeZoneLevel * 10);

        this.player = this.add.rectangle(150, 300, 40, 40, 0x00aaff);
        this.dragon = this.add.rectangle(650, 300, 120, 120, 0xff0000);
        this.zzzText = this.add.text(650, 210, 'Zzz...', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        this.add.rectangle(400, 500, 300, 20, 0x333333);
        this.greenZone = this.add.rectangle(400, 500, this.zoneWidth, 16, 0x00ff00);
        this.indicator = this.add.rectangle(250, 500, 10, 30, 0xffffff);

        this.add.text(400, 450, 'Нажми ПРОБЕЛ в зелёной зоне', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        this.goldText = this.add.text(20, 20, 'Золото: ' + playerData.totalGold, { fontSize: '24px', color: '#ffd700' });
        this.angerText = this.add.text(20, 60, 'Гнев дракона: 0%', { fontSize: '24px', color: '#ff4444' });
        this.stepsText = this.add.text(20, 100, 'Шаги: 0/' + this.maxSteps, { fontSize: '24px', color: '#ffffff' });

        this.input.keyboard!.on('keydown-SPACE', () => {
            if (this.isLocked || this.isTransitioning) return;
            
            if (this.steps >= this.maxSteps) {
                this.scene.start('EscapeScene');
                return;
            }
            
            this.checkHit();
        });
    }

    update(_time: number, delta: number) {
        if (this.isLocked || this.isTransitioning) return;

        this.indicator.x += this.meterSpeed * this.indicatorDirection * (delta / 1000);

        if (this.indicator.x >= 550) { this.indicator.x = 550; this.indicatorDirection = -1; }
        if (this.indicator.x <= 250) { this.indicator.x = 250; this.indicatorDirection = 1; }
    }

    checkHit() {
        this.isLocked = true;

        const zoneLeft = 400 - (this.zoneWidth / 2);
        const zoneRight = 400 + (this.zoneWidth / 2);
        const isHit = this.indicator.x >= zoneLeft && this.indicator.x <= zoneRight;

        this.steps++;
        this.stepsText.setText('Шаги: ' + this.steps + '/' + this.maxSteps);

        if (isHit) {
            this.gold += this.steps * 10; 
            playerData.totalGold += this.steps * 10;
            this.goldText.setText('Золото: ' + playerData.totalGold);
            this.cameras.main.flash(100, 0, 255, 0);

            this.tweens.add({
                targets: this.player,
                x: this.player.x + 40,
                duration: 200,
                ease: 'Power2'
            });

            this.meterSpeed += 30;
            this.zoneWidth = Math.max(15, this.zoneWidth - 5);
            this.greenZone.width = this.zoneWidth;
            this.greenZone.setSize(this.zoneWidth, 16); 
        } else {
            this.anger += 25;
            this.angerText.setText('Гнев дракона: ' + this.anger + '%');
            this.cameras.main.shake(200, 0.02);

            this.tweens.add({
                targets: this.dragon,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
        }

        if (this.anger >= 100) {
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
        this.zzzText.setText('RAAAR!');
        this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.4);
        
        this.add.text(400, 200, 'Дракон проснулся!', { fontSize: '40px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 260, 'Вы в панике сбежали и потеряли 100 золота!', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        playerData.totalGold = Math.max(0, playerData.totalGold - 100);

        this.time.delayedCall(2500, () => {
            this.scene.start('ShopScene');
        });
    }

    reachNest() {
        this.isTransitioning = true;
        this.add.rectangle(400, 300, 800, 600, 0x00ff00, 0.3);
        this.add.text(400, 200, 'Вы дошли до гнезда!', { fontSize: '40px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 260, 'Вы украли яйцо!', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(400, 320, 'Нажми ПРОБЕЛ, чтобы начать побег!', { fontSize: '20px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.isLocked = false; 
    }
}

// ==========================================
// СЦЕНА 2: ПОБЕГ (Раннер)
// ==========================================
class EscapeScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private obstacles: Phaser.GameObjects.Rectangle[] = [];
    private velocityY = 0;
    private gravity = 2000;
    private jumpForce = -700;
    private isJumping = false;
    private spawnTimer = 0;
    private gameSpeed = 400;
    private isGameOver = false;
    private isWin = false;

    constructor() {
        super('EscapeScene');
    }

    create() {
        this.isGameOver = false;
        this.isWin = false;
        this.velocityY = 0;
        this.isJumping = false;
        this.obstacles = [];
        this.spawnTimer = 0;

        this.add.rectangle(400, 300, 800, 600, 0x1a1a1a);
        this.add.rectangle(400, 520, 800, 160, 0x2d2d2d);

        this.player = this.add.rectangle(200, 450, 40, 60, 0x00aaff);
        this.add.rectangle(50, 420, 80, 60, 0xff0000); // Дракон

        this.add.text(20, 20, 'Золото: ' + playerData.totalGold, { fontSize: '24px', color: '#ffd700' });
        this.add.text(400, 50, 'УБЕГАЙ! Жми ПРОБЕЛ, чтобы прыгнуть', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        this.time.delayedCall(15000, () => {
            if (!this.isGameOver) this.winGame();
        });

        this.input.keyboard!.on('keydown-SPACE', () => {
            if (this.isGameOver || this.isWin) {
                if (this.isWin) this.scene.start('ShopScene');
                if (this.isGameOver) this.scene.restart(); 
            } else if (!this.isJumping) {
                this.velocityY = this.jumpForce;
                this.isJumping = true;
            }
        });
    }

    update(_time: number, delta: number) {
        if (this.isGameOver || this.isWin) return;

        if (this.isJumping) {
            this.player.y += this.velocityY * (delta / 1000);
            this.velocityY += this.gravity * (delta / 1000);
            if (this.player.y >= 450) {
                this.player.y = 450;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }

        this.spawnTimer += delta;
        if (this.spawnTimer > 1200) {
            this.spawnTimer = 0;
            let obs = this.add.rectangle(850, 460, 40, 60, 0x555555);
            this.obstacles.push(obs);
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.x -= this.gameSpeed * (delta / 1000);

            if (obs.x < -50) {
                obs.destroy();
                this.obstacles.splice(i, 1);
            }

            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), obs.getBounds())) {
                this.loseGame();
            }
        }
    }

    loseGame() {
        this.isGameOver = true;
        this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.3);
        this.add.text(400, 250, 'Дракон догнал вас!', { fontSize: '40px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 300, 'Нажми ПРОБЕЛ, чтобы попробовать снова', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    }

    winGame() {
        this.isWin = true;
        this.add.rectangle(400, 300, 800, 600, 0x00ff00, 0.3);
        this.add.text(400, 250, 'Вы сбежали из пещеры!', { fontSize: '40px', color: '#00ff00', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 300, 'Нажми ПРОБЕЛ, чтобы пойти в магазин', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    }
}

// ==========================================
// СЦЕНА 3: МАГАЗИН
// ==========================================
class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x222222);
        this.add.text(400, 80, 'МАГАЗИН УЛУЧШЕНИЙ', { fontSize: '40px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 140, 'Золото: ' + playerData.totalGold, { fontSize: '30px', color: '#ffd700' }).setOrigin(0.5);

        this.createButton(400, 250, 'Скорость шагов', 'Ур. ' + playerData.upgradeSpeedLevel, 150, () => {
            let cost = 100 + (playerData.upgradeSpeedLevel * 50);
            if (playerData.totalGold >= cost && playerData.upgradeSpeedLevel < 3) {
                playerData.totalGold -= cost;
                playerData.upgradeSpeedLevel++;
                this.scene.restart();
            }
        });

        this.createButton(400, 350, 'Тихие шаги (Зона)', 'Ур. ' + playerData.upgradeZoneLevel, 150, () => {
            let cost = 100 + (playerData.upgradeZoneLevel * 50);
            if (playerData.totalGold >= cost && playerData.upgradeZoneLevel < 3) {
                playerData.totalGold -= cost;
                playerData.upgradeZoneLevel++;
                this.scene.restart();
            }
        });

        this.createButton(400, 480, 'В ПЕЩЕРУ', 'Начать', 200, () => {
            this.scene.start('CaveScene');
        });
    }

    createButton(x: number, y: number, title: string, subtitle: string, width: number, callback: () => void) {
        let bg = this.add.rectangle(x, y, width, 60, 0x444444).setInteractive({ useHandCursor: true });
        this.add.text(x, y - 10, title, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(x, y + 15, subtitle, { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => bg.setFillStyle(0x666666));
        bg.on('pointerout', () => bg.setFillStyle(0x444444));
    }
}

// ==========================================
// НАСТРОЙКА ИГРЫ
// ==========================================
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    parent: 'app',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [CaveScene, EscapeScene, ShopScene] 
};

new Phaser.Game(config);