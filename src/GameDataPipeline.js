"use strict";

define([
	'data_pipeline/JsonPipe',
	'data_pipeline/SvgPipe'
],
	function(
		JsonPipe,
		SvgPipe
		) {

		var GameDataPipeline = function() {

		};

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail)
		};

		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail) {
			SvgPipe.loadSvg(url, dataUpdated, fail)
		};

		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
		};

		GameDataPipeline.applyPipelineOptions = function(opts) {
			console.log("Apply pipeline opts:", opts)
			JsonPipe.setJsonPipeOpts(opts.jsonPipe);
			SvgPipe.setSvgPipeOpts(opts.jsonPipe);
		};

		return GameDataPipeline
	});