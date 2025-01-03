export class Storage {
	getById(id) {}
	getIdsByPosition(x, y) {}
	getIdByPosition(x, y, zIndex) {}

	add(id, data) {}
	update(id, data) {}
	delete(id) {}
}

export class ArrayStorage {
	#data = [];

	getById(id) {
		return this.#data.find(item => item.id == id);
	}
	getIdsByPosition(x, y) {
		return new Set(this.#data.filter(item => item.x == x && item.y == y).map(item => item.id));
	}
	getIdByPosition(x, y, zIndex) {
		return this.#data.find(item => item.x == x && item.y == y && item.zIndex == zIndex)?.id;
	}

	add(id, data) {
		this.#data.push(Object.assign(data, {id}));
	}

	update(id, data) {
		let index = this.#data.findIndex(item => item.id == id);
		Object.assign(this.#data[index], data);
	}

	delete(id) {
		let index = this.#data.findIndex(item => item.id == id);
		this.#data.splice(index, 1);
	}
}

function positionKey(x, y) { return `${x},${y}`; }

export class MapStorage extends Storage {
	#idToData = new Map();
	#idToKey = new Map();
	#keyToIds = new Map();

	getById(id) { return this.#idToData.get(id); }
	getIdsByPosition(x, y) { return this.#keyToIds.get(positionKey(x, y)) || new Set(); }
	getIdByPosition(x, y, zIndex) {
		let ids = this.getIdsByPosition(x, y);
		return [...ids].find(id => this.getById(id).zIndex == zIndex);
	}

	add(id, data) {
		this.#idToData.set(id, data);
		let key = positionKey(data.x, data.y);
		this.#idToKey.set(id, key);
		this.#addIdToSet(id, key);
	}

	update(id, data) {
		// update data storage
		let currentData = this.getById(id);
		Object.assign(currentData, data);

		let currentKey = this.#idToKey.get(id);
		let newKey = positionKey(currentData.x, currentData.y);
		if (currentKey != newKey) { // position changed
			this.#keyToIds.get(currentKey).delete(id);
			this.#addIdToSet(id, newKey);
			this.#idToKey.set(id, newKey);
		}
	}

	#addIdToSet(id, key) {
		if (this.#keyToIds.has(key)) {
			this.#keyToIds.get(key).add(id);
		} else {
			this.#keyToIds.set(key, new Set([id]));
		}
	}

	delete(id) {
		this.#idToData.delete(id);
		let key = this.#idToKey.get(id);
		this.#keyToIds.get(key).delete(id);
		this.#idToKey.delete(id);
	}
}
