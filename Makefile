rl-display.js: src/*.ts
	deno run -A jsr:@orgsoft/dsbuild --in src/rl-display.ts --out $@

test:
	deno test --no-check src

doc:
	deno doc --html src/rl-display.ts
