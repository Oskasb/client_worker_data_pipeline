"use strict";

define(['data_pipeline/data/ConfigCache'],
	function(
		ConfigCache
		) {


        var path = window.resourcePath;


		var PipelineAPI = function() {

		};

		PipelineAPI.addReadyCallback = function(cb) {
			ConfigCache.addReadyCallback(cb);
		};

		PipelineAPI.checkReadyState = function() {
			return ConfigCache.getReady();
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
			ConfigCache.loadBundleMaster(path, goo, masterUrl, assetUpdated, fail, notifyLoaderProgress)
		};

		PipelineAPI.meshCombineEntityList = function(entityList, combineDone) {
			ConfigCache.combineEntities(entityList, combineDone);
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