/**
 * PromptUI — Interface interativa do terminal.
 * 
 * Gerencia todos os menus e prompts de seleção
 * apresentados ao usuário via @inquirer/prompts.
 * 
 * Princípio: Responsabilidade Única (SRP) — lida apenas com UI
 * Princípio: Aberto/Fechado (OCP) — fácil adicionar novos menus
 */

import { select, checkbox } from '@inquirer/prompts';

export class PromptUI {

    /**
     * Exibe o menu principal com as opções de instalação.
     * 
     * @returns {Promise<string>} Opção selecionada ('kit' ou 'componente')
     */
    async menuPrincipal() {
        const escolha = await select({
            message: '📦 O que você deseja instalar?',
            choices: [
                {
                    name: '🎯 Kit Base — Estrutura completa para iniciar projetos',
                    value: 'kit',
                    description: 'Instala todos os arquivos base de um kit',
                },
                {
                    name: '🧩 Componente Individual — Selecione itens específicos',
                    value: 'componente',
                    description: 'Escolha componentes como botões, menus, etc.',
                },
            ],
        });

        return escolha;
    }

    /**
     * Exibe a lista de kits disponíveis para seleção.
     * 
     * @param {Array<{nome: string, caminho: string}>} kits - Kits disponíveis
     * @returns {Promise<{nome: string, caminho: string}>} Kit selecionado
     */
    async selecionarKit(kits) {
        if (kits.length === 0) {
            throw new Error('Nenhum kit disponível no repositório.');
        }

        const caminho = await select({
            message: '🎯 Selecione o kit para instalar:',
            choices: kits.map(kit => ({
                name: `📁 ${kit.nome}`,
                value: kit.caminho,
            })),
        });

        return kits.find(k => k.caminho === caminho);
    }

    /**
     * Exibe a lista de componentes para seleção múltipla (checkbox).
     * 
     * @param {Array<{nome: string, caminho: string}>} componentes - Componentes disponíveis
     * @returns {Promise<Array<{nome: string, caminho: string}>>} Componentes selecionados
     */
    async selecionarComponentes(componentes) {
        if (componentes.length === 0) {
            throw new Error('Nenhum componente disponível no repositório.');
        }

        const selecionados = await checkbox({
            message: '🧩 Selecione os componentes desejados (espaço para marcar):',
            choices: componentes.map(comp => ({
                name: `📦 ${comp.nome}`,
                value: comp.caminho,
            })),
            required: true,
        });

        return componentes.filter(c => selecionados.includes(c.caminho));
    }
}
