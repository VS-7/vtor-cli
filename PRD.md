# PRD: Shopify Component CLI (S-CLI)

## 1. Visão Geral
Um utilitário de linha de comando (CLI) focado em produtividade para desenvolvedores Shopify. O objetivo é automatizar a inserção de componentes (sections, snippets, blocks, etc.) de um repositório centralizado no GitHub diretamente para a estrutura local de um tema em desenvolvimento.

## 2. Objetivos
- **Velocidade:** Instalar kits base ou componentes isolados em segundos.
- **Padronização:** Manter a consistência do código entre diferentes projetos Shopify.
- **Multiplataforma:** Compatibilidade total com macOS, Windows e Linux via Node.js.

---

## 3. Requisitos Funcionais

### RF01: Interface Interativa (CLI UI)
O sistema deve apresentar um menu de seleção no terminal, permitindo ao usuário navegar entre as opções usando as setas do teclado.
- **Opção 1: Kit Base:** Instalação em massa de arquivos estruturais.
- **Opção 2: Componentes Individuais:** Seleção de itens específicos (ex: Botão WhatsApp, Carrossel).

### RF02: Mapeamento Automático de Diretórios (Padrão Shopify)
O CLI deve identificar a estrutura dos arquivos vindos do GitHub e depositá-los nas pastas correspondentes do tema Shopify local. Ele deve suportar e realizar o *scaffold* para os seguintes diretórios base da arquitetura Shopify:
- `assets/` -> Destino `./assets/` (CSS, JS, Imagens, Fontes)
- `blocks/` -> Destino `./blocks/` (Blocos de tema)
- `config/` -> Destino `./config/` (Configurações como `settings_schema.json`)
- `layout/` -> Destino `./layout/` (Layouts globais como `theme.liquid`)
- `locales/` -> Destino `./locales/` (Arquivos de tradução)
- `sections/` -> Destino `./sections/` (Seções modulares)
- `snippets/` -> Destino `./snippets/` (Fragmentos de código Liquid)
- `templates/` -> Destino `./templates/` (Modelos JSON/Liquid das páginas)

### RF03: Download Eficiente (Seed)
O app não deve realizar um `git clone` completo para evitar o overhead da pasta `.git`. Deve utilizar a lógica de "scaffolding" (ex: `tiged`) para baixar apenas o estado atual dos arquivos.

### RF04: Tratamento de Conflitos
Caso um arquivo com o mesmo nome já exista na pasta local, o CLI deve solicitar confirmação do usuário antes de sobrescrever.

---

## 4. Especificações Técnicas

| Componente | Tecnologia Sugerida | Motivo |
| :--- | :--- | :--- |
| **Ambiente** | Node.js (ESM) | Portabilidade e ecossistema rico em ferramentas de CLI. |
| **Parser de Comandos** | `commander` | Padrão da indústria para criar comandos como `app install`. |
| **Interface Visual** | `@inquirer/prompts` | Menus interativos modernos e fáceis de usar. |
| **Motor de Download** | `tiged` | Rápido, não baixa histórico do Git e suporta subdiretórios. |
| **File System** | `fs-extra` | Facilita a criação de pastas e movimentação de arquivos. |
| **Estilo** | `picocolors` | Feedback visual leve e elegante no terminal. |

---

## 5. Estrutura do Repositório de Origem (GitHub)
Para o funcionamento ideal, o repositório remoto deve refletir a estrutura nativa de diretórios abordada no RF02. Assim, cada componente ou kit organizará seus arquivos em pastas que levam o mesmo nome do destino final no tema Shopify:

```text
/templates-shopify
├── kits/
│   └── base/                   <-- Estrutura completa para iniciar projetos
│       ├── assets/             <-- Arquivos estáticos globais
│       ├── blocks/
│       ├── config/
│       ├── layout/
│       ├── locales/
│       ├── sections/
│       ├── snippets/
│       └── templates/          <-- Templates JSON da loja
├── components/
│   ├── whatsapp-btn/           <-- Componente isolado
│   │   ├── assets/             <-- CSS/JS específicos do botão
│   │   └── snippets/           <-- Código Liquid do botão
│   └── mega-menu/              <-- Seção complexa de cabeçalho
│       ├── assets/
│       ├── blocks/
│       └── sections/
```

---

## 6.Fluxo do Usuário (User Journey)
O desenvolvedor abre o terminal na raiz do tema Shopify.

Executa o comando (ex: shop-kit add).

O CLI busca a lista de componentes disponíveis no repositório remoto.

O usuário seleciona o componente desejado.

O CLI realiza o download, distribui os arquivos e confirma a operação com uma mensagem de sucesso.

## 7. Roadmap de Implementação
[ ] Fase 1: Setup do projeto Node.js, configuração do package.json e comando bin.

[ ] Fase 2: Implementação da integração com o GitHub para listagem e download.

[ ] Fase 3: Lógica de mapeamento de pastas locais e tratamento de erros.

[ ] Fase 4: Publicação (NPM ou Local) e testes em diferentes sistemas operacionais.
