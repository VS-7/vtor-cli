/**
 * App — Classe principal da aplicação.
 * 
 * Responsável por:
 * - Registrar comandos no Commander
 * - Instanciar e injetar dependências (Composition Root)
 * - Iniciar o CLI
 * 
 * Princípio: Inversão de Dependência (DIP) — atua como Composition Root
 * Princípio: Aberto/Fechado (OCP) — novos comandos são adicionados sem alterar o existente
 */

import { Command } from 'commander';
import { Logger } from './utils/logger.js';
import { PromptUI } from './ui/PromptUI.js';
import { TokenManager } from './auth/TokenManager.js';
import { GitHubService } from './services/GitHubService.js';
import { DownloadService } from './services/DownloadService.js';
import { FileMapper } from './filesystem/FileMapper.js';
import { ConflictResolver } from './filesystem/ConflictResolver.js';
import { AddCommand } from './commands/AddCommand.js';
import { ConfigCommand } from './commands/ConfigCommand.js';
import { CLI_NAME } from './config/constants.js';

export class App {

    constructor() {
        // -- Instância do Commander (parser de comandos) --
        this.programa = new Command();

        // -- Instanciação de dependências (Composition Root) --
        this.logger = new Logger();
        this.promptUI = new PromptUI();
        this.tokenManager = new TokenManager(this.logger);
        this.githubService = new GitHubService(this.logger, this.tokenManager);
        this.downloadService = new DownloadService(this.logger, this.tokenManager);
        this.conflictResolver = new ConflictResolver(this.logger);
        this.fileMapper = new FileMapper(this.logger, this.conflictResolver);

        // -- Comandos --
        this.addCommand = new AddCommand(
            this.logger,
            this.promptUI,
            this.githubService,
            this.downloadService,
            this.fileMapper
        );

        this.configCommand = new ConfigCommand(
            this.logger,
            this.tokenManager
        );
    }

    /**
     * Configura e executa o CLI.
     * Registra todos os comandos e faz o parse dos argumentos.
     */
    run() {
        this.programa
            .name(CLI_NAME)
            .description('CLI para instalar componentes Shopify de um repositório centralizado')
            .version('1.0.0');

        // Comando: vtor add
        this.programa
            .command('add')
            .description('Adiciona kits ou componentes ao tema Shopify atual')
            .action(async () => {
                this.logger.banner();
                await this.addCommand.executar();
            });

        // Comando: vtor config
        this.programa
            .command('config')
            .description('Configura o token de acesso para repositórios privados do GitHub')
            .action(async () => {
                this.logger.banner();
                await this.configCommand.executar();
            });

        // Comando padrão (sem argumentos) — abre o menu interativo
        this.programa
            .action(async () => {
                this.logger.banner();
                await this.addCommand.executar();
            });

        // Parse dos argumentos
        this.programa.parse(process.argv);
    }
}
