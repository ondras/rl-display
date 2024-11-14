function splitmix32(a) {
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
          t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

export default class RNG {
	constructor(seed) {
		this.seed = seed;
		this.random = splitmix32(seed);
	}

	randomInt(min, max) {
		return Math.floor(this.random() * (max - min + 1)) + min;
	}

	randomElement(array) {
		return array[this.randomInt(0, array.length - 1)];
	}
}
