# 🎮 TikPlay Live — Jogos Interativos para TikTok LIVE

Plataforma completa de minijogos interativos estilo **TikPlay.games** para transmissões ao vivo no **TikTok LIVE** com suporte a **OBS Studio**, **TikTok Live Studio** e **Prism Live Studio**.

O público interage e joga em tempo real através de **comentários no chat**, **curtidas** e **presentes** (Rosas, Donuts, Galáxias, Leões, etc.).

---

## 🕹️ Minijogos Inclusos e Jogáveis

1. **⚔️ Nations at War (Guerra de Nações)**:
   - 4 Facções: 🇧🇷 Brasil (`#brasil`), 🇺🇸 EUA (`#usa`), 🇦🇷 Argentina (`#argentina`), 🇯🇵 Japão (`#japao`).
   - Comentários no chat geram tropas.
   - Presentes invocam tanques e bombardeios aéreos para conquistar os 100 territórios do mapa.
2. **🪢 Cabo de Guerra (Tug of War)**:
   - Disputa entre **Time Rosa** (`#rosa`) e **Time Azul** (`#azul`).
   - Curtidas e comentários puxam a corda; presentes desferem puxões gigantes.
3. **🥊 Duelo de Tapas (Slap Battle Arena)**:
   - Batalha 1v1 entre Lutador 1 (`#1`) e Lutador 2 (`#2`).
   - Barra de HP, efeitos visuais de impacto (*POW!*, *TAPAÇO!*, *CRÍTICO!*) e nocaute.
4. **🎰 Plinko da Sorte**:
   - Tabuleiro com pinos e física realista.
   - Multiplicadores na base: `2x`, `5x`, `20x` e `100x JACKPOT`.
5. **🧱 Torre de Blocos 3D**:
   - Torre isométrica em SVG 3D onde presentes empilham ou derrubam blocos ao vivo.

---

## ⚡ Conexão com o TikTok LIVE

O projeto conta com **2 modos de conexão**:

### 1. 🧪 Modo Simulador Integrado (Sem precisar estar ao vivo)
- Clique no botão flutuante **"🧪 Testar TikTok Live"** no canto inferior direito.
- Você pode simular curtidas em massa, comentários de times (`#brasil`, `#rosa`, `#1`, etc.) e presentes (`Rosa`, `Donut`, `Galáxia`).
- Há também o modo **"Auto Live"**, que dispara interações automáticas a cada 2 segundos para testar overlays no OBS.

### 2. 📡 Conexão Real com a sua Live (via `tiktok-live-connector`)
Para receber comentários e presentes reais da sua transmissão:
1. Abra um terminal na pasta do projeto.
2. Execute o comando com o seu usuário do TikTok:
   ```bash
   node tiktok-bridge.mjs seu_usuario_tiktok
   ```
   *(Ou execute `npm run bridge -- seu_usuario_tiktok`)*
3. A ponte iniciará um servidor WebSocket na porta `21213`. O painel e os overlays conectarão automaticamente e receberão todos os eventos da live com latência de menos de 100ms!

---

## 🎥 Como Usar no OBS Studio / TikTok Live Studio

1. Inicie a aplicação com `npm run dev` (ou acesse o link publicado).
2. No OBS Studio, adicione uma nova fonte: **Navegador (Browser Source)**.
3. Coloque a URL do jogo desejado:
   - **Guerra de Nações**: `http://localhost:3000/overlay?game=nations-at-war`
   - **Cabo de Guerra**: `http://localhost:3000/overlay?game=tug-of-war`
   - **Duelo de Tapas**: `http://localhost:3000/overlay?game=slap-battle`
   - **Plinko da Sorte**: `http://localhost:3000/overlay?game=plinko-luck`
   - **Torre de Blocos 3D**: `http://localhost:3000/overlay/torre`
4. Configure a resolução:
   - Para Live Vertical (celular): Largura: `1080`, Altura: `1920`.
   - Para Live Horizontal (PC): Largura: `1920`, Altura: `1080`.
5. Marque a opção **"Desligar fonte quando não visível"** se desejar.

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

---

## 📦 Tecnologias Utilizadas
- **React 19** + **TypeScript**
- **TanStack Router & TanStack Start**
- **Tailwind CSS v4** (Tema Dark Cyberpunk & Efeitos Neon)
- **Web Audio API** (Efeitos sonoros nativos sem arquivos externos)
- **tiktok-live-connector** + **ws** (Integração oficial TikTok Live)
- **Lucide Icons**
