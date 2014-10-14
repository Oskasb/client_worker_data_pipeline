"use strict";

define([
	'io/pipeline/JsonPipe',
	'io/pipeline/SvgPipe'
],
	function(
		JsonPipe,
		SvgPipe
		) {

		var options = {
			pollData:true
		};

		var GameDataPipeline = function() {

		};

		GameDataPipeline.setDataPipelineOptions = function(opts) {
			for (var index in opts) {
				options[index] = opts[index];
			}
		};

		var checkPolling = function(activate) {
			if (options.pollData && activate) {
				return true
			}
		};

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail, activatePolling) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail, checkPolling(activatePolling))
		};

		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail, activatePolling) {
			SvgPipe.loadSvg(url, dataUpdated, fail, checkPolling(activatePolling))
		};

		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
		};

		return GameDataPipeline
	});