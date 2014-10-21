"use strict";

define([
	'data_pipeline/pipes/JsonPipe',
	'data_pipeline/pipes/SvgPipe',
	'data_pipeline/pipes/ImagePipe',
	'data_pipeline/pipes/GooPipe'
],
	function(
		JsonPipe,
		SvgPipe,
		ImagePipe,
		GooPipe
		) {

		var GameDataPipeline = function() {

		};

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail)
		};

		GameDataPipeline.loadGooBundleFromUrl = function(path, goo, url, fileName, dataUpdated, fail) {
			GooPipe.loadBundleFromFolderUrl(path, goo, url, fileName, dataUpdated, fail)
		};

		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail) {
			SvgPipe.loadSvg(url, dataUpdated, fail)
		};

		GameDataPipeline.loadImageFromUrl = function(url, dataUpdated, fail) {
			ImagePipe.loadImage(url, dataUpdated, fail)
		};


		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
			GooPipe.tickGooPipe(tpf);
			ImagePipe.tickImagePipe(tpf);
		};

		GameDataPipeline.applyPipelineOptions = function(opts) {
			console.log("Apply pipeline opts:", opts);
			JsonPipe.setJsonPipeOpts(opts.jsonPipe);
			SvgPipe.setSvgPipeOpts(opts.jsonPipe);
			GooPipe.setGooPipeOpts(opts.gooPipe);
			ImagePipe.setImagePipeOpts(opts.imagePipe);
		};

		return GameDataPipeline
	});