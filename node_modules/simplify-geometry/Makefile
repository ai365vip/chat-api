all: simplifygeometry-0.0.2.js simplifygeometry-0.0.2.min.js

simplifygeometry-0.0.2.js: lib/index.js package.json
	browserify -s simplifyGeometry lib/index.js > simplifygeometry-0.0.2.js

simplifygeometry-0.0.2.min.js: simplifygeometry-0.0.2.js
	uglifyjs simplifygeometry-0.0.2.js -c > simplifygeometry-0.0.2.min.js
