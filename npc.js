import { nameByRace } from 'fantasy-name-generator';

var NPC = function() {
    this.name = nameByRace('human');
    this.generatePersonality();
    this.generateDialogue();

    return this;
}

NPC.prototype.generatePersonality = function() {
    this.generalDisposition = ['happy', 'happy', 'happy', 'happy', 'sad', 'moody', 'fearful'].randomItem();
}

NPC.prototype.generateDialogue = function() {
    if (!this.personality) this.generatePersonality();
    this.dialogueTree = {
        greetingDefault: {
            prompt: this.generateGreeting(),
            options: [
                {
                    text: 'How are you today?',
                    redirect: 'greetingReturn'
                },
                {
                    text: 'I should go.',
                    pageRedirect: '../'
                }
            ]
        },
        npcFirstMeet0: {
            prompt: 'Oh?  What about?',
            options: [
                {
                    text: 'INSERT COOL STORY PROMPT HERE',
                    redirect: 'npcFirstMeet1'
                },
                {
                    text: '...nothing, nevermind',
                    redirect: 'greetingDefault'
                }
            ]
        }
    }
}

NPC.prototype.addDialogueOption = function(dialogue, option) {
    this.dialogueTree[dialogue].options.splice(0, 0, option);
}

NPC.prototype.generateGreeting = function() {
    let greeting;
    switch(this.generalDisposition) {
        case 'happy':
            var greetWord = ['~hello~', '~hello~ there', 'Why, ~hello~'].randomItem();
            var greetName = ['~player~'].randomItem();
            var greetAddendum = ['How are you on this ~fine~ day?', 'How are you ~today~?', 'How do you do?', 'How goes it?', 'How goes it with you today?',
                'I trust you are doing ~well~ today?', 'I hope you are doing ~well~ today!', 'What can I do for you?', 'What can I do for ya?', 'How can I help you?',
                'Anything I can do for you?'].randomItem();
    
            greeting = greetWord + ', ' + greetName + '! ' + greetAddendum;
            break;
        case 'sad':
            var greetWord = ['~hello~', 'Well met'].randomItem();
            var greetName = ['~player~'].randomItem();
            var greetAddendum = ['How are you?', 'What can I do for you?', 'Not having the best of days today, but I suppose I\'ll manage.',
                'Hope you\'re having a ~better~ day than I am.' + Math.random() < 0.5 ? ' Truly.' : '',
                'What do you want?'].randomItem();
            
            greeting = greetWord + ', ' + greetName + '. ' + greetAddendum;
            break;
        case 'moody':
            var greetWord = ['Bah!', 'Ugh!', 'Hmph.', '~hello~.'].randomItem();
            var greetAddendum = ['What do you want?', 'Stop ~bothering~ me.', 'Go away.', 'Leave me alone.', 'Go ~bother~ somebody else.'].randomItem();
            
            greeting = greetWord + ' ' + greetAddendum;
            break;
        case 'fearful':
            var greetWord = ['What?', 'What is it?', 'Who are you?', 'Psh!'].randomItem();
            var greetAddendum = ['Why are you talking to me?', 'Please, leave me ~alone~!', 'Mind your own business!', 'What do you want?'].randomItem();

            greeting = greetWord + ' ' + greetAddendum;
            break;
    }

    return greeting;
}

export default NPC;