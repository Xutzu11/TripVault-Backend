class Museum {
    constructor(id, name, location, revenue) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.revenue = revenue;
    }
    isEqual(otherMuseum) {
        return this.name === otherMuseum.name && this.location === otherMuseum.location;
    }
}

module.exports = Museum;