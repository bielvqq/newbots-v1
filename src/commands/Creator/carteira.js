const { Command } = require('../..');

module.exports = class CarteiraCommand extends Command {
    constructor(client) {
        super(
            {
                name: 'carteira',
                category: 'Creator',
                description: '💳 » CARTEIRA « Veja a quantidade de moedas que você ou alguém possui.',
                options: [
                    {
                        name: 'usuario',
                        type: 6,
                        description: '💳 » CARTEIRA « Coloque o usuário para ver as moedas.',
                        required: false
                    },
                ]
            },
            client
        );
    }

    async run({ message, args }) {
    }
};