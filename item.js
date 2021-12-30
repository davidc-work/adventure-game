const Item = function(name, value, type, properties) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.properties = properties;
    
    return this;
}

export default Item;