
rl-display.js: src/*.ts
	$(ESBUILD) src/rl-display.ts --bundle --minify --outfile=$@

