import Mineflayer from "mineflayer";
import { ClientOptions, Client } from "minecraft-protocol"
import { CommandManager } from "../systems/commands";

type ServerInfo = {
    ip: string,
    port: number
}
let index: number = 0;
export class MineflayerBot {
    public mf: Mineflayer.Bot;
    public commands: CommandManager;
    public serverInfo: ServerInfo;

    public chatMode: 'public' | 'private' = 'public';

    /**
     * A bot
     * @param botUsername Bot username
     * @param botHost Bot host ip
     * @param botPort Bot host port
     * @param botAuth Bot auth type
     */
    constructor(botUsername: string, botHost: string, botPort: number, botAuth: 'mojang' | 'microsoft' | 'offline' | ((client: Client, options: ClientOptions) => void)) {
        this.serverInfo = {
            ip: botHost,
            port: botPort
        }
        this.mf = Mineflayer.createBot({
            username: botUsername,
            host: botHost,
            port: botPort == undefined ? 25565 : botPort,
            auth: botAuth
        });
        this.commands = new CommandManager(this);
    }

    chat(message: string, username: string) {
        if(this.chatMode == 'public') this.mf.chat("(" + username + ") " + message)
        else this.mf.whisper(username, message);
    }

    getMineflayerPluginAccessor(): any {
        return this.mf;
    }
}
