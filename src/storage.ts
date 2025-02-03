interface BaseData {
	x: number;
	y: number;
	zIndex: number;
}

export abstract class Storage<ID, D = {}> {
	abstract getById(id: ID): (D & BaseData) | undefined;
	abstract getIdsByPosition(x: number, y: number): Set<ID>;
	abstract getIdByPosition(x: number, y: number, zIndex: number): ID | undefined;

	abstract add(id: ID, data: (D & BaseData)): void;
	abstract update(id: ID, data: Partial<(D & BaseData)>): void;
	abstract delete(id: ID): void;
}

export class ArrayStorage<ID, D = {}> extends Storage<ID, D> {
	#data: (D & BaseData & {id: ID})[] = [];

	getById(id: ID) {
		return this.#data.find(item => item.id == id);
	}
	getIdsByPosition(x: number, y:number) {
		return new Set(this.#data.filter(item => item.x == x && item.y == y).map(item => item.id));
	}
	getIdByPosition(x: number, y: number, zIndex:number) {
		return this.#data.find(item => item.x == x && item.y == y && item.zIndex == zIndex)?.id;
	}

	add(id: ID, data: D & BaseData) {
		this.#data.push(Object.assign(data, {id}));
	}

	update(id: ID, data: Partial<D & BaseData>) {
		let index = this.#data.findIndex(item => item.id == id);
		Object.assign(this.#data[index], data);
	}

	delete(id: ID) {
		let index = this.#data.findIndex(item => item.id == id);
		this.#data.splice(index, 1);
	}
}

function positionKey(x: number, y: number) { return `${x},${y}`; }

export class MapStorage<ID, D = {}> extends Storage<ID, D> {
	#idToData = new Map<ID, D & BaseData & {id:ID}>();
	#idToKey = new Map<ID, string>();
	#keyToIds = new Map<string, Set<ID>>();

	getById(id: ID) { return this.#idToData.get(id); }
	getIdsByPosition(x: number, y: number) { return this.#keyToIds.get(positionKey(x, y)) || new Set(); }
	getIdByPosition(x: number, y: number, zIndex: number) {
		let ids = this.getIdsByPosition(x, y);
		return [...ids].find(id => this.getById(id).zIndex == zIndex);
	}

	add(id: ID, data: D & BaseData) {
		this.#idToData.set(id, data);
		let key = positionKey(data.x, data.y);
		this.#idToKey.set(id, key);
		this.#addIdToSet(id, key);
	}

	update(id: ID, data: Partial<D & BaseData>) {
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

	#addIdToSet(id: ID, key: string) {
		if (this.#keyToIds.has(key)) {
			this.#keyToIds.get(key).add(id);
		} else {
			this.#keyToIds.set(key, new Set([id]));
		}
	}

	delete(id: ID) {
		this.#idToData.delete(id);
		let key = this.#idToKey.get(id);
		this.#keyToIds.get(key).delete(id);
		this.#idToKey.delete(id);
	}
}
