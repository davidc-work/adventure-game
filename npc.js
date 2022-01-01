import { nameByRace } from 'fantasy-name-generator';

var NPC = function() {
    this.name = nameByRace('human');
    this.generateAttributes();
    this.generatePersonality();
    this.generateDialogue();

    this.generateIntroduction();

    return this;
}

NPC.prototype.generateIntroduction = function() {
    if (!this.attributes) this.generateAttributes();
    const isMale = this.attributes.gender == 'male';
    const pronoun = isMale ? 'He' : 'She';
    const heightAdj = this.attributes.height > 66 ? 'tall' : 'short';
    const ageAdj = this.attributes.age < 40 ? 'younger' : 'older';
    const man = isMale ? 'man' : 'woman';

    this.introduction = pronoun +  ' is a ' + heightAdj + ', ' + ageAdj + ' ' + man + 
        ' with ' + this.attributes.eyeColor + ' eyes and ' + this.attributes.hairColor + 
        ' hair.';
    switch (this.personality.generalDisposition) {
        case 'happy': 
            this.introduction += ' ' + pronoun + ' appears to be in a good mood.';
            break;
        case 'sad':
            this.introduction += ' ' + pronoun + ' appears to be in a bad mood.';
            break;
        case 'moody':
            this.introduction += ' ' + pronoun + ' appears to have no interest in talking to you.';
            break;
        case 'fearful':
            this.introduction += ' ' + pronoun + ' appears to be frightened, for some reason.';
            break;
    }
}

NPC.prototype.generatePersonality = function() {
    this.personality = {
        generalDisposition: ['happy', 'sad', 'moody', 'fearful'].randomItem([0.6, 0.7, 0.95, 1])
    }
}

NPC.prototype.generateAttributes = function() {
    this.attributes = {
        age: 18 + Math.floor(Math.random() * 62),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        height: 60 + Math.floor(Math.random() * 14),
        eyeColor: ['hazel', 'blue', 'gray', 'brown', 'green', 'amber'].randomItem(),
        hairColor: ['dark', 'brown', 'blonde', 'red'].randomItem()
    }

    if (this.attributes.age > (60 - Math.random() * 10)) this.attributes.hairColor = 'white';
}

NPC.prototype.generateDialogue = function() {
    if (!this.personality) this.generatePersonality();
    if (!this.attributes) this.generateAttributes();
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
    switch(this.personality.generalDisposition) {
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