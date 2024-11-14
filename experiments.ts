interface HasPosition {
	position: [number, number];
  }

  interface HasHealth {
	health: number;
  }

  let orc = {
	position: [1,3],
  //  health: 10
  }

  let pc = {};

  interface ComponentMap {
	position: HasPosition;
	health: HasHealth;
  }

  function QueryInterface<T extends keyof ComponentMap>(obj: any, t: T): ComponentMap[T] | null {
	if (t in obj) { return obj; }
	return null;
  }

  function CheckInterface<T extends keyof ComponentMap>(obj: any, t: T): obj is ComponentMap[T] {
	return (t in obj);
  }

  let o = QueryInterface(orc, "health");
  if (o) console.log(o.health);

  if (CheckInterface(orc, "health")) {
	console.log(orc.health);
  }


  type pickUnion = keyof ComponentMap;
  type ManyResult<T extends pickUnion> = {
	[P in T]: ComponentMap[P]
  }

  function ensureKeys(obj: any, keys: string[]) {
	if (keys.every(k => k in obj)) return obj;
	return null;
  }


  interface HasA {
	a: number;
  }

  interface HasBBB {
	bbb: string;
  }



  interface Values {
	"a": HasA;
	"b": HasBBB;
  }
  type Keys = keyof Values;

  type Struct<K extends Keys> = {
	[P in K]: Values[P];
  }

  function createStruct<K extends Keys>(keys: K[]): Struct<K> {
	return {} as Struct<K>;
  }

  let struct = createStruct(["b"]);
  struct.a = 3
  struct.bbb = "3";

  /*
  let struct:Struct<(keyof Values)[]> = {
	a: 3,
	b: 4
  }
  */
