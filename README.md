# 🚀 VTOR CLI — Shopify Component Tool

CLI para instalar componentes Shopify de um repositório centralizado no GitHub.

## Instalação

```bash
# Instalar dependências
npm install

# Linkar globalmente (para usar o comando "vtor" no terminal)
npm link
```

## Uso

```bash
# Abre o menu interativo
vtor

# Comando direto
vtor add
```

Caso tenha algum repositorio privado, você pode configurar o token de acesso:

```bash
vtor config
```

# 1. Configurar o token (uma única vez)

```bash
node bin/vtor.js config
```

# 2. Usar normalmente — autenticação é automática

```bash
node bin/vtor.js add
```

## Estrutura do Projeto

```
src/
├── app.js                  # Classe principal (Composition Root)
├── commands/
│   └── AddCommand.js       # Comando "add" — orquestra o fluxo
├── ui/
│   └── PromptUI.js         # Menus interativos (Inquirer)
├── services/
│   ├── GitHubService.js    # Comunicação com GitHub API
│   └── DownloadService.js  # Download via tiged
├── filesystem/
│   ├── FileMapper.js       # Mapeamento de diretórios Shopify
│   └── ConflictResolver.js # Tratamento de conflitos
├── config/
│   └── constants.js        # Constantes globais
└── utils/
    └── logger.js           # Logger com feedback visual
```

## Tecnologias

- **Node.js** (ESM) — Ambiente de execução
- **Commander** — Parser de comandos CLI
- **Inquirer** — Menus interativos
- **tiged** — Download eficiente sem `.git`
- **fs-extra** — Manipulação de arquivos
- **picocolors** — Estilo visual no terminal
