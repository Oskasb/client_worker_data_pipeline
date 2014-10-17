"use strict";

define(['data_pipeline/data/ConfigCache'],
	function(
		ConfigCache
		) {

		var PipelineAPI = function() {

		};

		PipelineAPI.readCachedConfigKey = function(category, key) {
			return ConfigCache.getConfigKey(category, key)
		};

		PipelineAPI.subscribeToCategoryUpdate = function(category, onDataCallback) {
			ConfigCache.registerCategoryUpdatedCallback(category, onDataCallback)
		};

		PipelineAPI.subscribeToCategoryKey = function(category, key, onDataCallback) {
			ConfigCache.subscribeToCategoryKey(category, key, onDataCallback)
		};

		PipelineAPI.subscribeToGooBundle = function(goo, bundleConf, success, fail) {
			ConfigCache.cacheGooBundleFromUrl(goo, bundleConf, success, fail)
		};

		PipelineAPI.subscribeToConfigUrl = function(url, success, fail) {
			ConfigCache.cacheFromUrl(url, success, fail)
		};

		PipelineAPI.cacheSvgFromUrl = function(url, success, fail) {
			ConfigCache.cacheSvgFromUrl(url, success, fail)
		};

		PipelineAPI.getCachedConfigs = function() {
			return ConfigCache.getCachedConfigs();
		};

		PipelineAPI.updateDataPipeline = function(tpf) {
			ConfigCache.tickDataPipeline(tpf);
		};


		return PipelineAPI;
	});