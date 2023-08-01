const { Command } = require('../..');

module.exports = class PainelCommand extends Command {
    constructor(client) {
        super(
            {
                name: 'painel',
                category: 'Creator',
                description: '🔰 » MENU DE PAINEIS ADMINISTRATIVOS «'
            },
            client
        );
    }

    async run({ message, args }) {
    }
};