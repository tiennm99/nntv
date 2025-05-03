# Stealth Grid - A Turn-Based Stealth Game

Stealth Grid is a turn-based stealth puzzle game where you navigate through a grid-based environment while avoiding detection by various types of guards. Your goal is to reach the exit point in each level without being caught.

## Game Overview

In Stealth Grid, you play as a stealthy character trying to navigate through increasingly complex levels. Each level consists of a grid where:

- You must move from your starting position to the green goal cell
- Gray cells represent walls that block movement
- Colored triangles represent different types of guards that create light in certain cells
- If you step into a lit cell, you'll be detected and lose a life
- You have 3 lives to complete all levels

## Game Features

- **Turn-based gameplay**: Each move you make triggers the guards to take their turn
- **Multiple guard types**:
  - Static Guards (red): Light up fixed cells around them
  - Rotating Guards (blue): Rotate and light up cells in different directions each turn
  - Blinking Guards (yellow): Toggle their lights on and off each turn
  - Patrolling Guards (purple): Move along predefined paths, lighting cells around them
- **Progressive difficulty**: 12 levels with increasing complexity and new mechanics
- **Grid-based movement**: Move one cell at a time using arrow keys or by clicking adjacent cells
- **Stealth mechanics**: Avoid lit cells to remain undetected
- **Lives system**: You have 3 lives to complete all levels

## Versions

This game is built with:

- [Phaser 3.88.2](https://github.com/phaserjs/phaser)
- [Vite 5.3.1](https://github.com/vitejs/vite)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## How to Play

- Use **arrow keys** to move your character one cell at a time
- Alternatively, **click** on an adjacent cell to move there
- Reach the **green goal cell** to complete each level
- Avoid stepping on **yellow lit cells** or you'll be detected and lose a life
- Plan your moves carefully as each guard behaves differently:
  - **Red guards** (Static): Always light the same cells
  - **Blue guards** (Rotating): Change the direction they light each turn
  - **Yellow guards** (Blinking): Turn their lights on and off each turn
  - **Purple guards** (Patrolling): Move along a path, lighting cells around them

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data (see "About log.js" below) |
| `npm run build-nolog` | Create a production build in the `dist` folder without sending anonymous data (see "About log.js" below) |

## Development

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Vite documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `index.html`                 | A basic HTML page to contain the game.                     |
| `public/assets`              | Game sprites, audio, etc. Served directly at runtime.      |
| `public/style.css`           | Global layout styles.                                      |
| `src/main.js`                | Application bootstrap.                                     |
| `src/game`                   | Folder containing the game code.                           |
| `src/game/main.js`           | Game entry point: configures and starts the game.          |
| `src/game/scenes`            | Folder with all Phaser game scenes.                        |

## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Vite

If you want to customize your build, such as adding plugin (i.e. for loading CSS or fonts), you can modify the `vite/config.*.mjs` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Vite documentation](https://vitejs.dev/) for more information.

## Game Architecture

The game is built with a modular architecture:

- **Grid System**: Manages the game grid, walls, goals, and lighting
- **Player**: Handles player movement and detection
- **Guards**: Different types of guards with unique behaviors
- **Turn Manager**: Controls the turn-based gameplay
- **Lighting System**: Manages which cells are lit by guards
- **Level Manager**: Loads level data and sets up the game environment

## Future Enhancements

Potential features for future development:

- Additional guard types with new behaviors
- Power-ups that provide temporary abilities
- Level editor for creating custom levels
- High score system
- Sound effects and background music
- Mobile-friendly controls

## About the Template

This game was built using the Phaser 3 Vite template. The template includes a logging feature that sends anonymous usage data to Phaser Studio. If you don't want to send this data, you can use the `-nolog` commands or disable the logging entirely.

## Credits

- Built with [Phaser 3](https://phaser.io)
- Developed as a turn-based stealth puzzle game
- Inspired by classic stealth games

---

Game developed using Phaser 3. Phaser is an open source framework for Canvas and WebGL powered browser games.

Learn more about Phaser at [phaser.io](https://phaser.io)
