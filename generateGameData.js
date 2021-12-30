import World from "./world.js";
import Quest from "./quest.js";
import Item from './item.js';

const generateGameData = function(port) {
    return ({
        port: port,
        world: new World(),
        currentGold: 1000,
        inventory: [new Item('Short Sword', 5, 'weapon', {
            dmg: 5
        })],
        dialogueTree: {
            main: {
                inTown: {
                    prompt: 'You are currently in the town of %currentTown%.',
                    options: [
                        {
                            text: 'View my stats',
                            redirect: 'viewStats'
                        },
                        {
                            text: 'View my inventory',
                            redirect: 'viewInventory'
                        },
                        {
                            text: 'View my quests',
                            redirect: 'viewQuests'
                        },
                        {
                            text: 'Talk to someone.',
                            redirect: 'viewNPCS'
                        },
                        {
                            text: 'Visit shops.',
                            redirect: 'viewShops'
                        },
                        /*{
                            text: 'View homes.',
                            redirect: 'viewHomes'
                        },*/
                        {
                            text: 'Visit another town.',
                            redirect: 'viewTowns'
                        },
                        {
                            text: '*DEMO CHEAT* Add 1000 gold.',
                            serverAction: {
                                action: 'addGold',
                                data: 1000
                            }
                        }
                    ]
                },
                viewStats: {
                    prompt: 'Your stats:\n Gold: %currentGold%',
                    autoredirect: 'inTown'
                },
                viewInventory: {
                    prompt: 'Your inventory:',
                    options: []
                },
                viewQuests: {
                    prompt: 'Your quests:',
                    options: []
                },
                viewNPCS: {
                    prompt: 'List of NPCS:',
                    options: []
                },
                viewShops: {
                    prompt: 'List of shops:',
                    options: []
                },
                viewTowns: {
                    prompt: 'Visit another town:',
                    options: []
                }
            }
        },
        questTree: {
            gettingStarted: new Quest('Find @firstNPCMeet@', 1, 'Find and talk to @firstNPCMeet@ in @firstNPCMeetTown@.')
        },
        eventVars: {
            firstNPCMeet: undefined,
            fistNPCMeetTown: undefined,
            firstNPCMeetMet: false
        }
    });
}

export default generateGameData;