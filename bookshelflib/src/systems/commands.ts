import { MineflayerBot } from "../bot/bot";
import { SwarmCommandManager } from "./swarmCommands";

type Command = {
    /**
     * @param bot `MineflayerBot` instance
     * @param args `string[]` of arguments (always includes the name of the command as the first element)
     */
    runnable: Function,
    name: string,
    description: string,
    /**
     * TODO
     */
    usage: string,
    permissionLevel: 1 | 2 | 3 | 4
}

type CommandPerms = {
    users: string[],
    admins: string[],
    owners: string[]
}


export class CommandManager {
    bot: MineflayerBot;
    commands: Command[];
    commandPerms: CommandPerms;
    constructor(bot: MineflayerBot) {
        this.bot = bot;
        this.commandPerms = {
            users: [],
            admins: [],
            owners: []
        };
        this.commands = [];
    }

    /**
     * registers a command
     * @param command the command object @see Command
     */
    register(command: Command) {
        this.commands.push(command);
    }

    /**
     * Internal method for running commands, there shouldn't be any reason to use this.
     * Bypasses some checks + command output
     * @see runCommand
     * @param commmand command string
     * @param runnerName username of the player who ran the command
     * @returns 
     */
    runInternal(commmand: string, runnerName: string): string {
        let result: string = "Unknown command";
        let gc: boolean = false;
        this.commands.forEach(element => {
            if(gc) return;
            let args: string[] = commmand.split(" ");
            let name: string = args[0];
            if(!name || name == "") result = "Empty command"
            if(element.name.toLowerCase() == name.toLowerCase()) {
                gc = true;
                if(this.hasPermLevel(runnerName, element.permissionLevel)) {
                    element.runnable(this.bot, args);
                    result = ""
                }
                else result = "No permission"; 
            }
        });
        return result;
    }

    /**
     * method for running commands
     * @param command the full command string
     * @param runner username of the player who ran the command
     */
    runCommand(command: string, runner: string) {
        let res: string = this.runInternal(command, runner);        
        if(res != "") this.bot.chat(res, runner)    
    }

    /**
     * Set command permissions
     * @see CommandPerms
     * @param perms The permission object
     */
    setPerms(perms: CommandPerms) {
        this.commandPerms = perms;
    }

    private hasPermLevel(username: string, permLevel: 1 | 2 | 3 | 4): boolean {
        let userLevel: 1 | 2 | 3 | 4 = 1;
        if(this.commandPerms.owners.includes(username)) userLevel = 4
        else if(this.commandPerms.admins.includes(username)) userLevel = 3
        else if(this.commandPerms.users.includes(username)) userLevel = 2
        return userLevel >= permLevel
    }

}