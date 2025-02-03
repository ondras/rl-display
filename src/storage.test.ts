import { assertEquals, assertInstanceOf } from "jsr:@std/assert";
import * as storage from "./storage.ts";


function test(ctor) {
	let L = `${ctor.name}: `;
	Deno.test(L + "empty record", () => {
		let s = new ctor();
		assertEquals(s.getById("id"), undefined);
		assertEquals(s.getIdsByPosition(2, 3).size, 0);
		assertEquals(s.getIdByPosition(2, 3, 1), undefined);
	});

	Deno.test(L + "store and retrieve by id", () => {
		let data = {};
		let s = new ctor();
		s.add("id", data);
		assertEquals(s.getById("id"), data);
	});

	Deno.test(L + "store and update", () => {
		let s = new ctor();
		let data = {p:1};
		s.add("id", data);
		s.update("id", {p:2});
		assertEquals(s.getById("id").p, 2);
	});

	Deno.test(L + "store and remove", () => {
		let s = new ctor();
		s.add("id", {});
		s.delete("id");
		assertEquals(s.getById("id"), undefined);
	});

	Deno.test(L + "store and retrieve by position", () => {
		let s = new ctor();
		s.add("id1", {x:2, y:3});
		s.add("id2", {x:2, y:3});

		let ids = s.getIdsByPosition(2, 3);
		assertInstanceOf(ids, Set)
		assertEquals([...ids].join(","), "id1,id2");
	});

	Deno.test(L + "store and retrieve by position + zindex", () => {
		let s = new ctor();
		s.add("id0", {x:2, y:3, zIndex:0});
		s.add("id1", {x:2, y:3, zIndex:1});
		s.add("id2", {x:2, y:3, zIndex:2});

		assertEquals(s.getIdByPosition(2, 3, 0), "id0");
		assertEquals(s.getIdByPosition(2, 3, 1), "id1");
		assertEquals(s.getIdByPosition(2, 3, 2), "id2");
	});

	Deno.test(L + "update 2d index", () => {
		let s = new ctor();
		s.add("id", {x:2, y:3});
		s.update("id", {x:3, y:4});

		assertEquals(s.getIdsByPosition(2, 3).size, 0);
		assertEquals(s.getIdsByPosition(3, 4).size, 1);
	});

	Deno.test(L + "update z index", () => {
		let s = new ctor();
		s.add("id", {x:2, y:3, zIndex:1});
		s.update("id", {x:2, y:3, zIndex:2});

		assertEquals(s.getIdByPosition(2, 3, 1), undefined);
		assertEquals(s.getIdByPosition(2, 3, 2), "id");
	});

	Deno.test(L + "update 3d index", () => {
		let s = new ctor();
		s.add("id", {x:2, y:3, zIndex:1});
		s.update("id", {x:3, y:4, zIndex:2});

		assertEquals(s.getIdByPosition(2, 3, 1), undefined);
		assertEquals(s.getIdByPosition(3, 4, 2), "id");
	});
}


test(storage.ArrayStorage);
test(storage.MapStorage);

