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



		PipelineAPI.initBundleDownload = function(goo, masterUrl, assetUpdated, fail) {


			var bundleArray;

			var success = function(srcKey, loaderData) {
				assetUpdated(srcKey, loaderData);
				if (bundleArray.length) {
					processNext();
				}
			}.bind(this);

			var processNext = function() {
				var cacheFail = function(err) {
					console.error("Failed to cache bundle: ", err);
				};
				ConfigCache.cacheGooBundleFromUrl(goo, bundleArray.shift(), success, cacheFail)
			};


			var registerBundleList = function(bundles) {
				bundleArray = bundles;
				processNext();
			};

			var bundleMasterUpdated = function(srcKey, data) {
				console.log("Bundle Master Update: ", srcKey, data);
				for (var i = 0; i < data.length; i++) {
					registerBundleList(data[i].bundle_index.bundles);
				}
			};

			ConfigCache.cacheFromUrl(masterUrl, bundleMasterUpdated, fail);

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