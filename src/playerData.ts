export let playerData = {
    totalGold: 0,
    totalEggs: 0, 
    runsCompleted: 0,         
    upgradeSpeedLevel: 0,
    upgradeZoneLevel: 0,
    
    currentCaveLevel: 1, // В какую пещеру идем сейчас
    maxCaveLevel: 1,     // Самая глубокая открытая пещера
    equippedSkin: '🏃', // Текущий скин (по умолчанию бегун)
    hermesBootsActive: false,
    hasAegis: false,          
    hasAchillesShield: false, 
    hasMidasHand: false       
};

export function loadGame() {
    let saved = localStorage.getItem('dragonCaveSave');
    if (saved) {
        let data = JSON.parse(saved);
        playerData.totalGold = data.totalGold || 0;
        playerData.totalEggs = data.totalEggs || 0;
        playerData.upgradeSpeedLevel = data.upgradeSpeedLevel || 0;
        playerData.upgradeZoneLevel = data.upgradeZoneLevel || 0;
        playerData.equippedSkin = data.equippedSkin || '🏃';
        playerData.currentCaveLevel = data.currentCaveLevel || 1;
        playerData.runsCompleted = data.runsCompleted || 0;


        playerData.maxCaveLevel = data.maxCaveLevel || 1;
        
        playerData.hasAegis = data.hasAegis || false;
        playerData.hasAchillesShield = data.hasAchillesShield || false;
        playerData.hasMidasHand = data.hasMidasHand || false;
        playerData.hermesBootsActive = false; 
    }
}

export function saveGame() {
    localStorage.setItem('dragonCaveSave', JSON.stringify(playerData));
}