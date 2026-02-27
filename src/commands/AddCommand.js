/**
 * AddCommand — Comando "add" do CLI.
 * 
 * Orquestra o fluxo de instalação:
 * 1. Exibe menu de seleção (kit ou componente)
 * 2. Lista itens disponíveis via GitHub
 * 3. Realiza download via tiged
 * 4. Distribui arquivos nas pastas corretas
 * 
 * Princípio: Inversão de Dependência (DIP) — todas as dependências são injetadas
 * Princípio: Responsabilidade Única (SRP) — orquestra apenas o fluxo do comando "add"
 */

import path from 'path';
import os from 'os';
import fs from 'fs-extra';

export class AddCommand {

    /**
     * @param {import('../utils/logger.js').Logger} logger
     * @param {import('../ui/PromptUI.js').PromptUI} promptUI
     * @param {import('../services/GitHubService.js').GitHubService} githubService
     * @param {import('../services/DownloadService.js').DownloadService} downloadService
     * @param {import('../filesystem/FileMapper.js').FileMapper} fileMapper
     */
    constructor(logger, promptUI, githubService, downloadService, fileMapper) {
        this.logger = logger;
        this.promptUI = promptUI;
        this.githubService = githubService;
        this.downloadService = downloadService;
        this.fileMapper = fileMapper;
    }

    /**
     * Executa o fluxo principal do comando "add".
     * @returns {Promise<void>}
     */
    async executar() {
        try {
            // 1. Menu principal
            const tipoInstalacao = await this.promptUI.menuPrincipal();

            // 2. Delega para o fluxo correto
            if (tipoInstalacao === 'kit') {
                await this._instalarKit();
            } else {
                await this._instalarComponentes();
            }

        } catch (erro) {
            // Trata cancelamento do usuário (Ctrl+C)
            if (erro.name === 'ExitPromptError') {
                this.logger.aviso('Operação cancelada pelo usuário.');
                return;
            }
            this.logger.erro(`Erro durante a instalação: ${erro.message}`);
        }
    }

    /**
     * Fluxo de instalação de um kit completo.
     * @private
     */
    async _instalarKit() {
        // Lista kits disponíveis
        const kits = await this.githubService.listarKits();
        const kitSelecionado = await this.promptUI.selecionarKit(kits);

        this.logger.destaque(`\n📥 Instalando kit: ${kitSelecionado.nome}\n`);

        // Baixa e distribui
        await this._baixarEDistribuir(kitSelecionado.caminho, kitSelecionado.nome);
    }

    /**
     * Fluxo de instalação de componentes individuais.
     * @private
     */
    async _instalarComponentes() {
        // Lista componentes disponíveis
        const componentes = await this.githubService.listarComponentes();
        const selecionados = await this.promptUI.selecionarComponentes(componentes);

        this.logger.destaque(`\n📥 Instalando ${selecionados.length} componente(s)...\n`);

        // Baixa e distribui cada componente
        for (const componente of selecionados) {
            await this._baixarEDistribuir(componente.caminho, componente.nome);
        }
    }

    /**
     * Processo genérico: baixa do repositório e distribui nas pastas locais.
     * 
     * @param {string} caminhoRemoto - Caminho no repositório (ex: "components/whatsapp-btn")
     * @param {string} nomePacote - Nome do pacote para exibição nos logs
     * @private
     */
    async _baixarEDistribuir(caminhoRemoto, nomePacote) {
        // Cria pasta temporária para o download
        const pastaTmp = path.join(os.tmpdir(), `vtor-cli-${Date.now()}`);

        try {
            await fs.ensureDir(pastaTmp);

            // Download via tiged
            await this.downloadService.baixar(caminhoRemoto, pastaTmp);

            // Distribui nas pastas Shopify locais
            const diretorioAtual = process.cwd();
            const totalCopiados = await this.fileMapper.distribuir(pastaTmp, diretorioAtual);

            this.logger.sucesso(`\n🎉 "${nomePacote}" instalado! (${totalCopiados} arquivo(s) copiados)\n`);

        } finally {
            // Limpa pasta temporária
            await fs.remove(pastaTmp);
        }
    }
}
