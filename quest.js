const Quest = function(name, status, objective) {
    this.inProgress = status == 1;
    this.completed = status == 2;
    this.name = name;
    this.objective = objective;
    
    return this;
}

export default Quest;