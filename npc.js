import { nameByRace } from 'fantasy-name-generator';

var NPC = function(town) {
    this.town = Object.assign({}, town);
    this.town.people = undefined;  //stringify can't handle reference loops

    this.name = nameByRace('human');
    this.indexes = {};

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
    const pronoun2 = isMale ? 'Him' : 'Her';
    const possessive = isMale ? 'His' : 'Her';
    const heightAdj = this.attributes.height > 66 ? 'tall' : 'short';
    const ageAdj = this.attributes.age < 40 ? 'younger' : 'older';
    const man = isMale ? 'man' : 'woman';

    this.introduction = pronoun +  ' is a ' + heightAdj + ', ' + ageAdj + ' ' + man + 
        ' with ' + this.attributes.eyeColor + ' eyes and ' + this.attributes.hairColor + 
        ' hair.';
    this.introduction += ' ' + pronoun + ' ' + ['appears', 'seems'].randomItem() + ' ' + [
        ['to be in a ~good~ mood.', 'to be in a very ~good~ mood.'].randomItem(),
        ['to be in a ~bad~ mood.', 'to be in a very ~bad~ mood.'].randomItem(),
        ['to have no interest in talking to you.', 'to be in a really bad mood.', 
            'to want you to go away.', 'to be upset.', 'to be a bit moody.'].randomItem(),
        ['to be frightened, for some reason.', 'to be frightened.', 'to be scared.',
            'a bit on edge.', 'on edge.'].randomItem()
    ][this.indexes.mood];
    if (Math.random() < 0.7) this.introduction = this.introduction.slice(0, -1) + ' as ' + pronoun.toLowerCase() + ' ' + [
        ['~happily~ trods along.', '~happily~ greets you.', '~happily~ strolls through town.', 'gives you a polite nod.', 'gives you a cheerful greeting.',
            'greets you with a big grin.', 'looks over to you.'].randomItem(),
        ['~wistfully walks around.', '~wistfully~ walks around and sighs.', '~wistfully~ mopes about.', 'looks over to you with a look of total dismay.',
            'glances over at you unexcitedly', 'readies ' + possessive.toLowerCase() + 'self to talk to you, although it\'s abundantly clear that ' + pronoun.toLowerCase() + '\'s not really interested',
            'sighs and looks over at you.'].randomItem(),
        ['angrily strides through town.', 'gives you an annoyed stare.', 'frowns as you walk over to ' + pronoun2.toLowerCase() + '.', 'grunts when you comes over to ' + pronoun2.toLowerCase() + '.',
            'takes a look at you and rolls ' + possessive.toLowerCase() + ' eyes.'].randomItem(),
        ['frantically paces about.', 'nervously darts ' + possessive.toLowerCase() + ' eyes to and fro.', 'panics and looks all around.'].randomItem()
    ][this.indexes.mood]
}

NPC.prototype.personalities = ['happy', 'sad', 'moody', 'fearful'];

NPC.prototype.generatePersonality = function() {
    this.personality = {
        generalDisposition: this.personalities.randomItem([0.6, 0.7, 0.95, 1])
    }
    this.indexes.mood = this.personalities.findIndex(p => p == this.personality.generalDisposition);
}

NPC.prototype.generateAttributes = function() {
    this.attributes = {
        age: 18 + Math.floor(Math.random() * 62),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        height: 60 + Math.floor(Math.random() * 14),
        eyeColor: ['hazel', 'blue', 'gray', 'brown', 'green', 'amber'].randomItem(),
        hairColor: ['dark', 'brown', 'blonde', 'red'].randomItem()
    }

    this.attributes.timeLivedInTown = Math.floor(Math.random() * this.attributes.age);
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
                    redirect: 'greetingDefault1'
                },
                {
                    text: ['What', 'How much'].randomItem() + ' do you know about %currentTown%?',
                    redirect: 'townInfo1'
                },
                {
                    text: 'I should go.',
                    pageRedirect: '../'
                }
            ]
        },
        townInfo1: {
            prompt: this.generateTimeIntroduction(),
            autoredirect: 'townInfo2'
        },
        townInfo2: {
            prompt: this.generateTownInfo(),
            autoredirect: 'townInfo3'
        },
        townInfo3: {
            prompt: 'That\'s all I know.',
            autoredirect: 'greetingDefault'
        },
        greetingDefault1: {
            prompt: [
                'I\'m doing ~well~ today, thank you!',
                'I\'ve been better.',
                'What\'s it look like to you?',
                'I don\'t want to talk right now.'
            ][this.indexes.mood],
            autoredirect: 'greetingDefault'
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

NPC.prototype.generateTimeIntroduction = function(townName) {
    var timeSpentRelative = this.attributes.timeLivedInTown / this.attributes.age;
    var timeSpent = timeSpentRelative == 1 ? 'all' : 
        timeSpentRelative > 0.8 ? 'most' : 
        timeSpentRelative > 0.5 ? 'majority' :
        timeSpentRelative > 0.2 ? 'some' : 'brief';
    if (['some', 'brief'].includes(timeSpentRelative)) {
        return 'I\'ve only lived here for ' + this.attributes.timeLivedInTown + ' years. I don\'t know much about this town.';
    }
    var dialogue = ['all', 'most'].includes(timeSpentRelative) ? ('I\'ve lived here ' + (timeSpentRelative == 'all' ? 'all' : 'for the majority') + ' of my ' + 
        this.attributes.age + ' years of life.  I know a lot about this town.') : 
        ('I\'ve lived here for ' + this.attributes.timeLivedInTown + ' years. I know a fair bit about this town.');
    

    return dialogue;
}

NPC.prototype.generateTownInfo = function() {
    return '';
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
            var greetAddendum = ['What do you want?', 'Now stop ~bothering~ me.', 'Now go away.', 'Now leave me alone.', 'Now go ~bother~ somebody else.'].randomItem();
            
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