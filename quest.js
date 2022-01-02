const Quest = function(gameData, questId, status, currentObjective, progress) {
    this.questId = questId;
    this.questObj = gameData.questTree[questId];
    this.inProgress = status == 1;
    this.completed = status == 2;

    this.title = this.questObj.title;
    this.objectives = this.questObj.objectives.map((objective, i) => {
        var o = (typeof objective == 'function') ? objective(gameData) : objective;
        return {
            id: o.id,
            description: o.description,
            completed: progress ? progress[i] : false,
            questMarkerType: o.questMarkerType,
            questMarkerLocation: o.questMarkerLocation
        }
    });

    this.currentObjective = currentObjective || this.objectives[0].id;

    this.updateQuestMarker();
    
    return this;
}

Quest.prototype.updateQuestMarker = function() {
    var o = this.objectives.find(a => a.id == this.currentObjective);
    this.currentQuestMarker = {
        type: o.questMarkerType,
        location: o.questMarkerLocation
    }
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

    this.updateQuestMarker();

    return {
        changed: !(prevCompleted == this.completed && prevInProgress == this.inProgress)
    }
}

export default Quest;