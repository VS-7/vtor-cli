```mermaid
useCaseDiagram
    actor "Usuário Visitante" as UV
    actor "Inquilino" as IN
    actor "Proprietário" as PR
    actor "Corretor" as CO
    actor "Admin" as AD

    package "App Imobiliária" {
        usecase "Buscar Imóveis" as UC1
        usecase "Agendar Visita" as UC5
        usecase "Enviar Proposta" as UC6
        usecase "Anunciar Imóvel" as UC9
        usecase "Gerenciar Propostas" as UC11
        usecase "Assinar Contrato" as UC8
        usecase "Validar Anúncio" as UC16
    }

    UV --> UC1
    IN --> UC1
    IN --> UC5
    IN --> UC6
    IN --> UC8
    
    PR --> UC9
    PR --> UC11
    
    CO --> UC5
    
    AD --> UC16
    AD --> UC8
```

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
