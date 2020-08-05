import { NodeCG } from "nodecg/types/server";
import { emptySuccess, Result, success } from "nodecg-io-core/extension/utils/result";
import { ServiceBundle } from "nodecg-io-core/extension/serviceBundle";
import TelegramBot = require("node-telegram-bot-api");

interface TelegramServiceConfig {
    token: string;
    polling?: boolean;
    webHook?: boolean;
    onlyFirstMatch?: boolean;
    baseApiUrl?: string;
    filepath?: boolean;
}

export interface TelegramServiceClient {
    getRawClient(): TelegramBot;
}

module.exports = (nodecg: NodeCG) => {
    new TelegramService(nodecg, "telegram", __dirname, "../telegram-schema.json").register();
};

class TelegramService extends ServiceBundle<TelegramServiceConfig, TelegramServiceClient> {
    async validateConfig(config: TelegramServiceConfig): Promise<Result<void>> {
        const bot = new TelegramBot(config.token);
        await bot.getMe();

        return emptySuccess();
    }

    async createClient(config: TelegramServiceConfig): Promise<Result<TelegramServiceClient>> {
        const options: TelegramBot.ConstructorOptions = {
            baseApiUrl: config.baseApiUrl,
            filepath: config.filepath,
            onlyFirstMatch: config.onlyFirstMatch,
            polling: config.polling,
            webHook: config.webHook,
        };

        const bot = new TelegramBot(config.token, options);

        this.nodecg.log.info("Successfully connected to the telegram server.");

        return success({
            getRawClient() {
                return bot;
            },
        });
    }

    stopClient(client: TelegramServiceClient): void {
        if (client.getRawClient().isPolling()) {
            client.getRawClient().stopPolling();
        }
        if (client.getRawClient().hasOpenWebHook()) {
            client.getRawClient().closeWebHook();
        }
    }
}
