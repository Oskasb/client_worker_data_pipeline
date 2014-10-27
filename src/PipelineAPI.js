"use strict";

define(['data_pipeline/data/ConfigCache'],
	function(
		ConfigCache
		) {

		var PipelineAPI = function() {

		};

		PipelineAPI.addProgressCallback = function(callback) {
			ConfigCache.addProgressCallback(callback);
		};

		PipelineAPI.readCachedConfigKey = function(category, key) {
			return ConfigCache.getConfigKey(category, key)
		};

		PipelineAPI.subscribeToCategoryUpdate = function(category, onDataCallback) {
			return ConfigCache.registerCategoryUpdatedCallback(category, onDataCallback)
		};

		PipelineAPI.subscribeToCategoryKey = function(category, key, onDataCallback) {
			ConfigCache.subscribeToCategoryKey(category, key, onDataCallback)
		};

		PipelineAPI.cloneLoadedGooEntity = function(entityName, callback) {
			 ConfigCache.cloneCachedEntity(entityName, callback);
		};

		PipelineAPI.applyEnvironmentGooEntity = function(entityName, callback) {
			ConfigCache.reloadEnvironmentEntity(entityName, callback);
		};


		PipelineAPI.initBundleDownload = function(path, goo, masterUrl, assetUpdated, fail, notifyLoaderProgress) {

			var bundleArray;

			var success = function(srcKey, loaderData) {
				if (bundleArray.length) {
					var next =  bundleArray.shift();
					console.log("next bundle:", next);
					processNext(next);
				}
				assetUpdated(srcKey, loaderData);
			}.bind(this);

			var processNext = function(next) {
				var cacheFail = function(err) {
					console.error("Failed to cache bundle: ", err);
				};
				ConfigCache.cacheGooBundleFromUrl(path, goo,next, success, cacheFail, notifyLoaderProgress)
			};

			var registerBundleList = function(bundles) {
				bundleArray = bundles;
				processNext(bundleArray.shift());
			};

			var bundleMasterUpdated = function(srcKey, data) {
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

		PipelineAPI.cacheImageFromUrl = function(url, success, fail) {
			ConfigCache.cacheImageFromUrl(url, success, fail)

		};

		PipelineAPI.subscribeToImage = function(subscriberId, imageId, success) {
			ConfigCache.subscribeToImageId(subscriberId, imageId, success)
		};

		PipelineAPI.getCachedConfigs = function() {
			return ConfigCache.getCachedConfigs();
		};

		return PipelineAPI;
	});