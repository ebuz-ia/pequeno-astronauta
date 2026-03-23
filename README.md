# 🚀 Pequeno Astronauta - Exploradores da Galáxia

Jogo pixel art espacial em HTML5 Canvas. Explore 15 planetas, enfrente meteoros e naves inimigas, faça upgrades e desbloqueie o segredo do Núcleo Estelar.

## 🎮 Jogar
**[game.ebuz.com.br](https://game.ebuz.com.br)**

## 🛠 Stack
- **Engine**: Vanilla JavaScript + HTML5 Canvas (960x540)
- **Áudio**: Web Audio API (chiptune procedural, zero arquivos de som)
- **Deploy**: GitHub Pages
- **Dependências**: Nenhuma (zero frameworks)

## 📁 Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Entry point |
| `game.js` | Core engine, planetas, upgrades, save |
| `entities.js` | Sprites, naves, inimigos, robô |
| `scenes.js` | 5 cenas (launch, cockpit, flight, explore, puzzle) |
| `ui.js` | HUD, shop, menus |
| `audio.js` | Música e SFX procedurais |

## 🌍 Features
- 15 planetas em 3 tiers de dificuldade
- 5 buracos negros com mecânica gravitacional
- 3 tiers de nave (Explorer, Voyager, Odyssey)
- Sistema de upgrades (motor, tanque, escudo, bocal)
- 5 skins de nave
- Robô companheiro com 4 modos
- Sistema de combo (até 5x multiplicador)
- Música chiptune 100% procedural
- Easter egg: Núcleo Estelar (-30% consumo de fuel)
- Save/load via localStorage

## 🎯 Controles
- **WASD**: Mover nave/astronauta
- **SPACE**: Atirar / Interagir
- **E**: Interagir com NPCs
- **R**: Alternar modo do robô
- **M**: Ligar/desligar música

## 📋 Documentação
- [SDD Completo](../docs/SDD-PEQUENO-ASTRONAUTA.md) - Game design + especificação técnica

## 📜 Licença
Projeto privado - eBuz Negócios Digitais
