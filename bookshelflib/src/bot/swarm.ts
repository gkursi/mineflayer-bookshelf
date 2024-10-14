import { Player } from "mineflayer";
import { CommandManager } from "../systems/commands";
import { SwarmCommandManager } from "../systems/swarmCommands";
import { MineflayerBot } from "./bot";
import { Embed, Webhook } from '@vermaysha/discord-webhook'

export class Swarm {
    host: string;
    port: number;
    masterBot: MineflayerBot | null;
    bots: MineflayerBot[];
    commands: SwarmCommandManager;
    public chatRelay: string;
    public logRelay: string;
    constructor(/*host: String, port: Number*/) {
        this.host = "a";
        this.port = 1;
        this.commands = new SwarmCommandManager(this);
        this.masterBot = null;
        this.bots = [];
        this.chatRelay = "";
        this.logRelay = "";
    }

    /**
     * Add a bot to the swarm
     * @param bot The bot instance
     */
    addBot(bot: MineflayerBot) {
        this.bots.push(bot);
    }
    /**
     * Set the master bot (will send all commands to slave-bots and respond with things like "Invalid command" or "No permission")
     * It is required
     * @param masterBot The bot instance
     */
    setMasterBot(masterBot: MineflayerBot) {
        this.masterBot = masterBot;
        console.log("Set master bot to " + masterBot.mf.username)
        this.masterBot.mf.on("chat", (username: string, message: string) => {
            // console.log("Masterbot chat! (username: " + masterBot.mf.username + ")")
            if(this.chatRelay != "") this.discord_message(this.chatRelay, message, username, "Chat relay")
            this.handleBotChat(message, username);
        })
        this.masterBot.mf.on("playerJoined", (player: Player) => {
            if(this.chatRelay != "") this.discord_message(this.chatRelay, `${player.username} has joined the server.`, "System", "Chat relay")
        })

        this.masterBot.mf.on("playerLeft", (player: Player) => {
            if(this.chatRelay != "") this.discord_message(this.chatRelay, `${player.username} has left the server.`, "System", "Chat relay")
        })
    }

    /**
     * Is automatically assinged to the master bot, the chat pattern has to be set manually
     * @param msg The full chat message
     * @param author The message author's username
     */
    handleBotChat(msg: string, author: string) {
        // console.log("Handled swarm chat!")
        if(msg.startsWith("!")) this.commands.runCommand(msg.substring(1), author);
    }

    loadPlugin(mfPlugin: any) {
        this.bots.forEach(element => {
            element.mf.loadPlugin(mfPlugin);
        })
    }

    /**
     * Perform actions with all bots
     * @param runnable A function, will be given an instance of MineflayerBot, will be run for each bot
     */
    forEachBots(runnable: Function) {
        this.bots.forEach(element => runnable(element));
    }

    discord_message(webHookURL: string, message: string, username: string, server: string) {
        const hook = new Webhook(webHookURL)
        hook.setUsername("Chat log")

        const embed = new Embed()
        embed
            .setTitle(username)
            .setDescription(message)
            .setTimestamp()
            .setFooter({
                text: "On " + this.masterBot?.serverInfo.ip
            })

        hook.addEmbed(embed).send().catch((reason: any) => console.error(reason))
    }

    isBot(username: string | undefined):boolean {
        let isTrue: boolean = false;
        this.bots.forEach(element => {
            if(element.mf.username == username) isTrue = true;
        })
        if(this.masterBot?.mf.username == username) isTrue = true;
        return isTrue;
    }
}
