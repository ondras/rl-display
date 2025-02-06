MAIN := src/rl-display.ts

rl-display.js: src/*.ts
	deno run -A jsr:@orgsoft/dsbuild --in $(MAIN) --out $@

test:
	deno test src

doc:
	deno doc --html $(MAIN)

check:
	deno check $(MAIN)

demo: demo/index.js

demo/index.js: demo/src/*.ts
	deno run -A jsr:@orgsoft/dsbuild --in demo/src/index.ts --out $@
