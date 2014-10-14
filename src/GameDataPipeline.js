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

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail, activatePolling) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail, activatePolling)
		};

		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail, activatePolling) {
			SvgPipe.loadSvg(url, dataUpdated, fail, activatePolling)
		};

		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
		};

		return GameDataPipeline
	});