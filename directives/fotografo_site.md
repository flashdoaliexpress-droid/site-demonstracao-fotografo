# Diretiva: Site de Demonstração — Fotógrafo

## Objetivo
Gerar um site premium de demonstração para fotógrafos com background branco, seguindo os princípios do taste-skill.

## Entradas
- Nome do fotógrafo / estúdio
- Especialidade (retratos, casamentos, editorial, etc.)
- Paleta de cores preferida (padrão: branco + preto + dourado)
- Fotos do portfólio (se fornecidas)

## Saídas
- `site/index.html` — página única completa
- `site/css/style.css` — estilos premium
- `site/js/main.js` — interações e animação da câmera

## Parâmetros de Design (taste-skill)
- DESIGN_VARIANCE: 7
- MOTION_INTENSITY: 7
- VISUAL_DENSITY: 3

## Seções do Site
1. **Nav** — logo + links flutuante, minimalista
2. **Hero** — split: texto esquerda / animação câmera direita (espaço reservado para animação 3D futura)
3. **Portfolio** — grid assimétrico tipo masonry
4. **Serviços** — layout editorial em duas colunas
5. **Sobre** — foto + texto em divisão horizontal
6. **Depoimentos** — carrossel minimalista
7. **Contato** — form minimalista + redes sociais
8. **Footer** — logo + links + copyright

## Regras de Design
- Fonte heading: Playfair Display (serif elegante)
- Fonte body: DM Sans
- Cores: #FFFFFF bg, #0A0A0A text, #C8A96E accent (dourado), #F2F2F0 bg-alt
- Sem bordas grossas, sem sombras genéricas
- Animações apenas via transform/opacity
- Cards apenas quando necessário
- Layout assimétrico, não centralizado demais

## Animação Hero (câmera)
- SVG animado da câmera se desmontando e montando
- Peças: corpo, lente, anéis da lente, visor, botão shutter, flash
- Cada peça entra de direção diferente com timing escalonado
- Loop infinito com pausa entre ciclos
- Espaço reservado: lado direito do hero (50% width em desktop, full em mobile abaixo do texto)

## Edge Cases
- Imagens: usar unsplash source URLs como placeholder
- Mobile: menu hamburger, hero empilhado
- Sem JS: conteúdo ainda legível
