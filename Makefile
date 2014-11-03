all: js/us.topojson

js/us.topojson: 
	topojson \
		-o js/us.topojson \
		--id-property STATE_ABBR \
		--post-quantization=1000 \
		--no-pre-quantization\
		source-data/states.shp 
