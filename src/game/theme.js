// Shared visual theme constants for Night Ninja: Twilight Voyage

export const COLORS = {
    // Backgrounds
    bgDark: 0x0a0a1a,
    bgPanel: 0x1a1a2e,
    bgOverlay: 0x000000,

    // Buttons
    btnDefault: 0x16213e,
    btnHover: 0x0f3460,
    btnBorder: 0x533483,

    // Grid
    gridEmpty: 0x1a1a2e,
    gridWall: 0x4a4a5e,
    gridGoal: 0x00c853,
    gridLit: 0xffea00,
    gridBorder: 0x2a2a3e,

    // Text
    textPrimary: '#e0e0ff',
    textSecondary: '#9999bb',
    textAccent: '#bb86fc',
    textDanger: '#ff5555',
    textTitle: '#ffffff',

    // Guards
    guardStatic: 0xff4444,
    guardRotating: 0x4488ff,
    guardBlinking: 0xffdd44,
    guardBlinkingOff: 0x887722,
    guardPatrolling: 0xbb44ff,

    // Player
    player: 0x111111,
};

export const FONTS = {
    title: 'bold 36px Arial',
    heading: 'bold 28px Arial',
    button: '22px Arial',
    buttonSmall: '18px Arial',
    body: '20px Arial',
    small: '16px Arial',
    ui: '18px Arial',
};

// Create a styled button with consistent look
export function createButton(scene, x, y, text, onClick, width = 220, height = 50) {
    const border = scene.add.rectangle(x, y, width + 4, height + 4, COLORS.btnBorder);
    const bg = scene.add.rectangle(x, y, width, height, COLORS.btnDefault);
    const label = scene.add.text(x, y, text, {
        font: FONTS.button,
        fill: COLORS.textPrimary,
    });
    label.setOrigin(0.5, 0.5);

    bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => bg.fillColor = COLORS.btnHover)
        .on('pointerout', () => bg.fillColor = COLORS.btnDefault)
        .on('pointerdown', onClick);

    return { border, bg, label };
}

// Create a small UI button (for pause, menu, etc.)
export function createSmallButton(scene, x, y, text, onClick) {
    return createButton(scene, x, y, text, onClick, 110, 34);
}
