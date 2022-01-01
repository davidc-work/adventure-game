const Quest = function(questTree, questId, status, progress) {
    this.questId = questId;
    this.questObj = questTree[questId];
    this.inProgress = status == 1;
    this.completed = status == 2;

    this.title = this.questObj.title;
    this.objectives = this.questObj.objectives.map((o, i) => {
        return {
            id: o.id,
            description: o.description,
            completed: progress ? progress[i] : false
        }
    });
    
    return this;
}

Quest.prototype.setObjectiveStatus = function(id, completed) {
    var prevCompleted = this.completed;
    var prevInProgress = this.inProgress;
    let objective = this.objectives.find(o => o.id == id);
    if (!objective) return ;

    objective.completed = completed;
    const allStatuses = this.objectives.map(o => o.completed);
    const a = Array.from(new Set(allStatuses));
    if (a.length == 1) {
        this.completed = a[0];
        this.inProgress = false;
    } else {
        this.completed = false;
        this.inProgress = true;
    }

    return {
        changed: !(prevCompleted == this.completed && prevInProgress == this.inProgress)
    }
}

export default Quest;