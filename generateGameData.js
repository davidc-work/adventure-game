import World from "./world.js";
import Quest from "./quest.js";
import Item from './item.js';

const generateGameData = function(port) {
    return ({
        port: port,
        world: new World(),
        level: 0,
        currentGold: 1000,
        inventory: [new Item('Short Sword', 5, 'weapon', {
            damage: 5
        })],
        dialogueTree: {
            main: {
                inTown: {
                    prompt: 'You are currently in the town of %currentTown%.',
                    options: [
                        {
                            text: 'View my stats.',
                            action: {
                                action: 'displayMultipleTexts',
                                lines: [
                                    'Your stats:',
                                    'Gold: %currentGold%'
                                ]
                            }
                        },
                        {
                            text: 'View my inventory.',
                            redirect: 'viewInventory'
                        },
                        {
                            text: 'View my quests.',
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
                viewInventory: {
                    prompt: 'Your inventory:',
                    options: []
                },
                viewQuests: {
                    prompt: 'Your quests:',
                    options: []
                },
                viewNPCS: {
                    prompt: 'List of Townspeople:',
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
            gettingStarted: {
                title: 'Find @firstNPCMeet@',
                objectives: [{
                    id: 'findFirstNPC',
                    description: 'Find and talk to @firstNPCMeet@ in @firstNPCMeetTown@.',
                }]
            },
        },
        currentQuests: [],
        eventVars: {
            firstNPCMeet: undefined,
            fistNPCMeetTown: undefined,
            firstNPCMeetMet: false
        },
        synonyms: {
            happy: ['happy', 'wonderful', 'great'],
            happily: ['happily', 'merrily', 'joyfully', 'excitedly'],
            wistfully: ['wistfully', 'cheerlessly', 'dolefully', 'gloomily'],
            good: ['good', 'happy', 'nice', 'pleasurable'],
            bad: ['bad', 'sour', 'unhappy', 'poor'],
            fine: ['fine', 'wonderful', 'splendid', 'great', 'phenomenal', 'terrific'],
            well: ['well', 'splendidly', 'wonderfully', 'exceptionally well', 'perfectly', 'happily'],
            hello: ['hello', 'howdy', 'greetings', 'salutations'],
            player: ['stranger', 'friend', 'newcomer', 'wanderer', 'adventurer'],
            today: ['today', 'this day'],
            bothering: ['bothering', 'pestering', 'annoying'],
            bother: ['bother', 'pester', 'annoy'],
            alone: ['alone', 'be'],
            better: ['better', 'nicer', 'more likable', 'more agreeable', 'more fortuitous'],
        }
    });
}

export default generateGameData;