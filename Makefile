MAIN := src/rl-display.ts
DSBUILD := jsr:@orgsoft/dsbuild
OUT := rl-display.js

$(OUT): src/*.ts
	deno run -A $(DSBUILD) --in $(MAIN) --out $(OUT)

test:
	deno test src

doc:
	deno doc --html $(MAIN)

check:
	deno check $(MAIN)

watch:
	deno run -A $(DSBUILD) --in $(MAIN) --out $(OUT) --live


demo: demo/index.js

demo/index.js: demo/src/*.ts
	deno run -A $(DSBUILD) --in demo/src/index.ts --out $@
