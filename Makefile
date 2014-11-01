all: js/us.topojson

js/us.topojson: 
	topojson \
		-o js/us.topojson \
		--id-property STATE_NAME \
		--post-quantization=1000 \
		--no-pre-quantization\
		source-data/states.shp 
