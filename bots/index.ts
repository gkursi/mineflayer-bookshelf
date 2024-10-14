import { MineflayerBot, Swarm } from "bookshelflib"

import mcData from "minecraft-data"
import { error } from "node:console"
import { on } from "node:events"
import { bool } from "prismarine-nbt"
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
import { Vec3 } from 'vec3'


const run = () => {
    let swarm = new Swarm()

function createBot(usr: string) {
    let bot = new MineflayerBot(usr, "Play.dupeanarchy.com", 25565, "offline")
    // let bot = new MineflayerBot(usr, "localhost", 25565, "offline")
    bot.mf.loadPlugin(require("mineflayer-armor-manager"))
    bot.mf.loadPlugin(require("mineflayer-pathfinder").pathfinder)
    bot.mf.loadPlugin(require("mineflayer-collectblock").plugin)
    bot.mf.loadPlugin(require("mineflayer-pvp").plugin)
    bot.mf.loadPlugin(require("mineflayer-tool").plugin)
    bot.mf.on("kicked", (reason) => {
        console.log("Kicked: " + reason)
        swarm.forEachBots((bot: MineflayerBot) => {
            bot.mf.quit()
        })
        // exec()
    })
    swarm.addBot(bot)
}

let masterBot = new MineflayerBot("MAIL", "Play.dupeanarchy.com", 25565, "microsoft")
// let masterBot = new MineflayerBot("b00kxbot_log", "localhost", 25565, "offline")
// for(let i = 1; i < 18; i++) {
//     setTimeout(() => createBot("b00kxbot_" + i), 10000 * i)
// }

masterBot.mf.on("kicked", (reason: any) => {
    swarm.forEachBots((bot: MineflayerBot) => {
        bot.mf.quit()
    })
    console.log("Got kicked for: " + reason)
    exec()
})


swarm.chatRelay = "RELAY-URL";

swarm.setMasterBot(masterBot)
swarm.addBot(masterBot)
swarm.commands.setPerms({
    owners: ["ItsBookxYT"],
    admins: ["Angel0fInfinity", "Superbrugs"],
    users: ["Popbob"]
})

swarm.loadPlugin(require("mineflayer-armor-manager"))
swarm.loadPlugin(require("mineflayer-pathfinder").pathfinder)
swarm.loadPlugin(require("mineflayer-collectblock").plugin)
swarm.loadPlugin(require("mineflayer-pvp").plugin)
swarm.loadPlugin(require("mineflayer-tool").plugin)



swarm.forEachBots((bot: MineflayerBot) => {
    bot.mf.on("spawn", () => {
        bot.getMineflayerPluginAccessor()._defaultMove = new Movements(bot.mf) // fixme
        bot.getMineflayerPluginAccessor()._flying = false;

        bot.getMineflayerPluginAccessor()._antiKickMove = false;
        bot.getMineflayerPluginAccessor()._flyGoalBlock = undefined;
    })

    bot.mf.on("playerCollect", (collector, collected) => {
        if(collector !== bot.mf.entity) return;

        setTimeout(() => {
            const sword: any = bot.mf.inventory.items().find(item => item.name.includes("sword"))
            if(sword) bot.mf.equip(sword, 'hand')
            else {
                const axe: any = bot.mf.inventory.items().find(item => item.name.includes("axe"))
                if(axe) bot.mf.equip(axe, 'hand')
            }
                
        }, 150)
    })

    bot.mf.on("playerCollect", (collector, collected) => {
        if(collector !== bot.mf.entity) return;

        setTimeout(() => {
            const shield: any = bot.mf.inventory.items().find(item => item.name.includes("shield"))
            if(shield) bot.mf.equip(shield, 'hand')  
        }, 250)
    })


    bot.mf.on("physicsTick", () => {
        if(!guardPos) return;

        const filter = (e: any) => (e.type === 'mob' /*|| (e.type === 'player' && swarm.commands.getPermLevel(e.username) <= 1 && !swarm.isBot(e.username))) */ && e.position.distanceTo(bot.mf.entity.position) < 16 && e.displayName !== "Armor Stand")
        const entity = bot.mf.nearestEntity(filter);
        if(entity) {
            console.log(`Found entity at ${entity.position.x} ${entity.position.y} ${entity.position.z}`)
            bot.getMineflayerPluginAccessor().pvp.attack(entity);
        } else {
            if(guardPos) moveToGuardPos(bot)
        }
    })

    bot.mf.on("physicsTick", () => {
        if(bot.getMineflayerPluginAccessor().pvp.target) return;
        if(bot.getMineflayerPluginAccessor().pathfinder.isMoving()) return;
        
        const entity = bot.mf.nearestEntity(e => !swarm.isBot(e.username))
        if(entity) {
            bot.mf.lookAt(entity.position.offset(0, entity.height, 0))
        }
    })

    
    bot.mf.on("physicsTick", () => {
        if(bot.getMineflayerPluginAccessor()._flying) {
            if(bot.getMineflayerPluginAccessor()._antiKickMove) {
                bot.mf.creative.flyTo(bot.mf.entity.position.offset(0, -0.5, 0))
                bot.getMineflayerPluginAccessor()._antiKickMove = false
            } else {
                bot.mf.creative.flyTo(bot.mf.entity.position.offset(0, 0.5, 0))
                bot.getMineflayerPluginAccessor()._antiKickMove = true
                if(bot.getMineflayerPluginAccessor()._flyGoalBlock) bot.mf.creative.flyTo(bot.getMineflayerPluginAccessor()._flyGoalBlock)
            }
        } else {
            bot.getMineflayerPluginAccessor()._antiKickMove = false
            bot.getMineflayerPluginAccessor()._flyGoalBlock = undefined
        }
    })

    bot.getMineflayerPluginAccessor().on("stoppedAttacking", () => {
        if(guardPos) moveToGuardPos(bot)
    })
})

swarm.commands.registerCommand({
    name: "test",
    description: "real",
    permissionLevel: 2,
    usage: "test",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        bot.chat("Command args: " + args.join(" "), runner)
    }
})

swarm.commands.registerCommand({
    name: "say",
    description: "real",
    permissionLevel: 2,
    usage: "say <text>",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        let nArgs = Object.assign([], args);
        nArgs.shift()
        bot.mf.chat(nArgs.join(" "))
    }
})

swarm.commands.registerCommand({
    name: "getPerms",
    description: "get permission level of a player",
    permissionLevel: 1,
    usage: "getPerms <username>",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        if(args.length <= 1) bot.chat("Usage: getPerms <username>", runner);
        else {
            let nArgs = Object.assign([], args);
            nArgs.shift()
            let target: string | undefined = nArgs.at(0);
            if(target! == "me") target = runner;
            bot.chat(`Perm level of ${target} is ${swarm.commands.getPermLevel(target!)}`, runner)
        }
    }
})

swarm.commands.registerCommand({
    name: "attack",
    description: "attack given username",
    permissionLevel: 3,
    usage: "attack <username>",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        if(args.length <= 1) bot.chat("Usage: attack <username>", runner);
        else {
                let nArgs = Object.assign([], args);
                nArgs.shift()
                let target: string | undefined = nArgs.at(0);
                
                // execution, target is given argument
                const player = bot.mf.players[target!]

                if (!player) {
                bot.chat("I can't see you.", runner)
                return
                }
                
                
                bot.getMineflayerPluginAccessor().pvp.attack(player.entity)
            }
        }
})

swarm.commands.registerCommand({
    name: "come",
    description: "come to given username",
    permissionLevel: 2,
    usage: "come <username>",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        if(args.length <= 1) bot.chat("Usage: come <username>", runner);
        else {
            let nArgs = Object.assign([], args);
            nArgs.shift()
            let target: string | undefined = nArgs.at(0);
            
            // execution
            const t = bot.mf.players[target!] ? bot.mf.players[target!].entity : null;
            if (!t) {
                bot.chat('I don\'t see you!', runner)
                return
            }
            const p = t.position
            const mcData = require("minecraft-data")(bot.mf.version)
            bot.getMineflayerPluginAccessor().pathfinder.setMovements(new Movements(bot.mf, mcData))
            bot.getMineflayerPluginAccessor().pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))        
        }
    }
})

swarm.commands.registerCommand({
    name: "pos",
    description: "get bot pos",
    permissionLevel: 2,
    usage: "pos",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        bot.chat(`My position is ${bot.mf.entity.position.x} ${bot.mf.entity.position.y} ${bot.mf.entity.position.z}`, runner)
    }
})

// swarm.commands.registerCommand({
//     name: "flyto",
//     description: "fly to given pos",
//     permissionLevel: 2,
//     usage: "goto <x> <y> <z>",
//     runnable: (bot: MineflayerBot, args: string[], runner: string) => {
//         if(args.length < 4) bot.chat("Usage: goto <x> <y> <z>", runner);
//         let x,y,z;

//         try {
//             x = Number.parseInt(args.at(1)!)
//             y = Number.parseInt(args.at(2)!)
//             z = Number.parseInt(args.at(3)!)
//         } catch {
//             bot.chat("Usage: goto <x> <y> <z>", runner);
//         }

//         bot.mf.creative.startFlying()
//         bot.mf.creative.flyTo(new Vec3(x!, y!, z!))
//         bot.getMineflayerPluginAccessor()._flying = true;
//         bot.getMineflayerPluginAccessor()._flyGoalBlock = new Vec3(x!, y!, z!);
//     }
// })

// swarm.commands.registerCommand({
//     name: "help",
//     description: "gives all commands",
//     permissionLevel: 1,
//     usage: "help",
//     runnable: (bot: MineflayerBot, args: string[], runner: string) => {
//         swarm.commands.commands.forEach((command: any, index: number) => {
//             setTimeout(() => {
//                 bot.chat(`${command.name} - ${command.description} (${command.permissionLevel})`, runner)
//                 bot.chat(`Usage: ${command.usage}`, runner)
//             }, 200 * index)
//         })   
//     }
// })

// guard logic
let guardPos: any = null;
swarm.commands.registerCommand({
    name: "guard",
    description: "start / stop guarding current bot pos",
    permissionLevel: 2,
    usage: "guard <start | stop>",
    runnable: (bot: MineflayerBot, args: string[], runner: string) => {
        if(args.length <= 1) bot.chat("Usage: guard <start / stop>", runner);
        else {
            let nArgs = Object.assign([], args);
            nArgs.shift()
            let target: string | undefined = nArgs.at(0);
            
            // execution, target is given argument
            switch(target!) {
                case "start":
                    guardPos = bot.mf.players[runner] ? bot.mf.players[runner].entity.position : null;
                    if(!guardPos) { 
                        bot.chat("I can't see you!", runner)
                        return;
                    }
                    moveToGuardPos(bot)
                    break;
                case "stop":
                    bot.getMineflayerPluginAccessor().pvp.stop()
                    bot.getMineflayerPluginAccessor().pathfinder.setGoal(null)
                    break;
                }
        }
    }
})

const moveToGuardPos = (bot: MineflayerBot) => {
    if(!bot.getMineflayerPluginAccessor().pvp.target) {
        const mcData = require("minecraft-data")(bot.mf.version)
        bot.getMineflayerPluginAccessor().pathfinder.setMovements(new Movements(bot.mf, mcData))
        bot.getMineflayerPluginAccessor().pathfinder.setGoal(new GoalNear(guardPos.x, guardPos.y, guardPos.Z))
        console.log("moving to pos")
    }
}

}

const exec = () => {
    try {
        setTimeout(() => {
            run()
        }, 500);
    } catch {
        console.log("Restarting after error")
        exec()
    }
}

process.on("uncaughtException", (error: Error) => {
    console.log(`Uncaught exception: ${error.name}: ${error.message}`)
    console.log(`Restarting in 5s`)
    setTimeout(() => {
        exec()
    }, 5000);
})

exec()
