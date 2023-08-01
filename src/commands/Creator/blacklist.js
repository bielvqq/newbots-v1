const { Command } = require('../..');

module.exports = class BlacklistCommand extends Command {
    constructor(client) {
        super(
            {
                name: 'blacklist',
                category: 'Creator',
                description: '🚫 » BLACKLIST « Painel de gerenciamento da Blacklist.',
            },
            client
        );
    }

    async run({ message, args }) {
    }
};