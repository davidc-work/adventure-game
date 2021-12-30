import { nameByRace } from 'fantasy-name-generator';

var NPC = function() {
    this.name = nameByRace('human');
    this.generateDialogue();

    return this;
}

NPC.prototype.generateDialogue = function() {
    this.dialogueTree = {
        greetingDefault: {
            prompt: this.generateGreeting(),
            options: [
                {
                    text: 'Not so bad, how about you?',
                    redirect: 'greetingReturn'
                },
                {
                    text: 'I should go.',
                    pageRedirect: '../'
                }
            ]
        }
    }
}

NPC.prototype.generateGreeting = function() {
    var greetWord = ['Hello', 'Howdy', 'Greetings', 'Salutations', 'Top of the morning'].randomItem();
    var greetName = ['stranger', 'friend', 'newcomer', 'wanderer', 'dude'].randomItem();
    var greetAddendum = ['How are you on this fine day?', 'How are you today?', 'How do you do?', 'How goes it?', 'How goes it with you today?',
        'I hope you are doing splendidly today!', 'I hope you are well today!', 'What can I do for you?', 'What can I do for ya?', 'How can I help you?',
        'Anything I can do for you?'].randomItem();
    return greetWord + ', ' + greetName + '! ' + greetAddendum;
}

export default NPC;