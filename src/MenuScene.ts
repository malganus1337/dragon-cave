import Phaser from 'phaser';
import { playerData,  } from './playerData';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Фон пещеры
        this.add.rectangle(400, 300, 800, 600, 0x1a1a1a);
        this.add.text(400, 80, 'ПЕЩЕРА ДРАКОНА', { fontSize: '40px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        
        // Золото и Яйца
        this.add.text(20, 20, '💰 ' + playerData.totalGold + '   🥚 ' + playerData.totalEggs, { fontSize: '24px', color: '#ffffff' }).setOrigin(0, 0.5);

        // Герой (Скин)
        this.add.text(400, 220, playerData.equippedSkin, { fontSize: '100px' }).setOrigin(0.5);

        // --- КНОПКИ ПО БОКАМ ---
        // Слева: Магазин
        let shopBtn = this.add.text(80, 250, '🛒', { fontSize: '60px' }).setOrigin(0.5).setInteractive({useHandCursor: true});
        this.add.text(80, 300, 'МАГАЗИН', { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
        shopBtn.on('pointerdown', () => { this.scene.start('ShopScene'); });

        // Справа: Скины
        let skinBtn = this.add.text(720, 250, '👕', { fontSize: '60px' }).setOrigin(0.5).setInteractive({useHandCursor: true});
        this.add.text(720, 300, 'СКИНЫ', { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
        skinBtn.on('pointerdown', () => { this.scene.start('SkinScene'); });

        // --- БОЛЬШАЯ КНОПКА ВХОДА ---
        let playBtnBg = this.add.rectangle(400, 380, 300, 70, 0x00aa00).setInteractive({useHandCursor: true});
        this.add.text(400, 380, 'ВОЙТИ В ПЕЩЕРУ', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        playBtnBg.on('pointerover', () => playBtnBg.setFillStyle(0x00cc00));
        playBtnBg.on('pointerout', () => playBtnBg.setFillStyle(0x00aa00));
        
        playBtnBg.on('pointerdown', () => {
            let blackout = this.add.rectangle(400, 300, 800, 600, 0x000000, 0).setDepth(10);
            this.tweens.add({
                targets: blackout,
                alpha: 1,
                duration: 400,
                onComplete: () => {
                    this.scene.start('CaveScene');
                }
            });
        });

        // --- НИЖНИЕ КНОПКИ ---
        // Туториал
        let tutBtn = this.add.text(200, 500, '📖 КАК ИГРАТЬ', { fontSize: '20px', color: '#ffffff', backgroundColor: '#333333', padding: {x: 10, y: 5} }).setOrigin(0.5).setInteractive({useHandCursor: true});
        tutBtn.on('pointerdown', () => {
            let tutBg = this.add.rectangle(400, 300, 700, 500, 0x000000, 0.9).setDepth(50).setInteractive();
            let tutText = this.add.text(400, 300, 
                'УПРАВЛЕНИЕ:\n\nСТЕЛС: Жми в зеленой зоне.\n\nБЕГ:\n⬆️ ВВЕРХ - Прыжок\n⬇️ ВНИЗ - Подкат\n🛡️ ЩИТ - Защита от огня\n\nНажми, чтобы закрыть', 
                { fontSize: '20px', color: '#ffffff', align: 'center', lineSpacing: 10 }
            ).setOrigin(0.5).setDepth(50);
            tutBg.on('pointerdown', () => { tutBg.destroy(); tutText.destroy(); });
        });

        // Титры
        let creditsBtn = this.add.text(400, 500, '📜 ТИТРЫ', { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0.5).setInteractive({useHandCursor: true});
        creditsBtn.on('pointerdown', () => {
            let credBg = this.add.rectangle(400, 300, 700, 400, 0x000000, 0.9).setDepth(50).setInteractive();
            let credText = this.add.text(400, 300, 
                'СОЗДАТЕЛИ:\n\nИдея: ТЫ\nКод: Нейросеть\nДвижок: Phaser 3\n\nНажми, чтобы закрыть', 
                { fontSize: '24px', color: '#ffffff', align: 'center', lineSpacing: 10 }
            ).setOrigin(0.5).setDepth(50);
            credBg.on('pointerdown', () => { credBg.destroy(); credText.destroy(); });
        });
    }
}