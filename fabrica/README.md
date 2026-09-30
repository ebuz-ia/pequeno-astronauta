# Fabrica de Pixel

Jogo tycoon 2D em HTML5 Canvas. Voce compra maquinas que produzem a moeda Pixel,
recolhe o dinheiro no armazenador antes de encher e cumpre missoes.

## Jogar
**[game.ebuz.com.br/fabrica](https://game.ebuz.com.br/fabrica)**

## Como editar
O jogo inteiro esta em `index.html` (HTML + CSS + JavaScript no mesmo arquivo).
Edite, faca commit na branch `main` e em cerca de 1 minuto ja esta no ar.

As tabelas de balanceamento ficam no topo do script:

- `MACHINES` — nome, custo e producao por segundo de cada maquina
- `STORAGE` — os 5 niveis do armazenador (capacidade e preco)
- `MAIN_MISSIONS` / `DAILY_MISSIONS` — missoes e recompensas

## Maquinas
| Maquina | Custo | Producao |
|---|---:|---:|
| 1265xv | gratis | R$ 2/s |
| 4555tr | R$ 100 | R$ 4/s |
| 900 | R$ 450 | R$ 6/s |
| 6000 | R$ 800 | R$ 8/s |
| 9000 | R$ 1.000 | R$ 11/s |
| 700 | R$ 1.500 | R$ 15/s |
| 5000 67 | R$ 2.200 | R$ 19/s |

## Armazenador
| Nivel | Guarda ate | Custo |
|---|---:|---:|
| 1 | R$ 25 | gratis |
| 2 | R$ 150 | R$ 200 |
| 3 | R$ 500 | R$ 600 |
| 4 | R$ 2.000 | R$ 2.500 |
| 5 | R$ 10.000 | R$ 8.000 |

## Arte
A aba MINHAS ARTES troca o desenho de qualquer maquina por um PNG proprio,
guardado no navegador junto com o save. Para a arte entrar no jogo publicado,
o desenho precisa virar arquivo dentro desta pasta e ser referenciado no codigo.

## Save
localStorage do navegador, com botoes de exportar e importar o progresso.

## Stack
Vanilla JavaScript + HTML5 Canvas, zero dependencias, deploy por GitHub Pages.
