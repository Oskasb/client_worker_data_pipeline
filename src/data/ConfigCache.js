"use strict";

define([
		'data_pipeline/GameDataPipeline',
		'data_pipeline/goodata/GooEntityCache'
	],
	function(
		GameDataPipeline,
		GooEntityCache
		) {
		var configs = {
			urls:{}
		};

		var pipelineReady = false;
		var readyCallbacks = [];

		var categories = {};
		var images = {};
		var imageSubs = {};
		var masterReset = function() {};
		var progressCallbacks = [];
		var requestedUrls = [];
		var loadedUrls = [];
		var remainingUrls = [];

		var gooEntityCache = new GooEntityCache();

		var ConfigCache = function() {

		};

		ConfigCache.pipelineReady = function(bool) {
			pipelineReady = bool;
			if (pipelineReady) {
				for (var i = 0; i < readyCallbacks.length; i++) {
					readyCallbacks[i]();
				}
				readyCallbacks.length = 0;
			}
		};

		ConfigCache.getReady = function() {
			return pipelineReady;
		};

		ConfigCache.addReadyCallback = function(cb) {
			readyCallbacks.push(cb);
		};

		ConfigCache.applyDataPipelineOptions = function(opts) {
			GameDataPipeline.applyPipelineOptions(opts)
		};

		ConfigCache.addProgressCallback = function(callback) {
			progressCallbacks.push(callback)
		};


		ConfigCache.setMasterResetFunction = function(callback) {
			masterReset = callback;
		};

		ConfigCache.storeImageRef = function(id, image) {
			ConfigCache.notifyUrlReadRequest(image.url);
			images[id] = image;
		};

		ConfigCache.getImageRef = function(id) {
			return images[id];
		};

		ConfigCache.addCategory = function(category) {
			configs[category] = {};
			categories[category] = {
				callbacks:[],
				subscription:{}
			}
		};

		ConfigCache.fireCategoryCallbacks = function(key) {
			for (var i = 0; i < categories[key].callbacks.length; i++) {
				categories[key].callbacks[i](key, configs[key]);
			}

			for (var index in categories[key].subscription) {
				if (configs[key][index]) {
					categories[key].subscription[index](index, configs[key][index]);
				}
			}
			masterReset();
		};


		ConfigCache.dataCombineToKey = function(key, url, data) {
			if (!configs[key]) {
				ConfigCache.addCategory(key);
			}
			for (var index in data[key]) {
				configs[key][index] = data[key][index];
			}

			ConfigCache.fireCategoryCallbacks(key);
		};



		ConfigCache.getCategory = function(category) {
			var data = configs[category];
			if (!data) return "No data "+category;
			return data;
		};

		ConfigCache.getConfigKey = function(category, key) {
			var data = ConfigCache.getCategory(category)[key];
			if(!data) return "No value for "+key;
			return data;
		};

		ConfigCache.registerCategoryKeySubscriber = function(category, key, callback) {
			if (!categories[category]) {
				ConfigCache.addCategory(category);
			}
			categories[category].subscription[key] = callback;

		};

		ConfigCache.registerCategoryUpdatedCallback = function(category, callback) {
			if (!categories[category]) {
				ConfigCache.addCategory(category);
			}
			categories[category].callbacks.push(callback);
		    return configs[category];
		};

		ConfigCache.subscribeToCategoryKey = function(category, key, callback) {
		    var data = ConfigCache.getConfigKey(category, key);
			if (typeof(data) != 'string') {
			    callback(key, data);
			}
			ConfigCache.registerCategoryKeySubscriber(category, key, callback);
		};


		ConfigCache.registerImageSub = function(subscriberId, imageId, callback) {
			if (!imageSubs[imageId]) imageSubs[imageId] = {};
			imageSubs[imageId][subscriberId] = callback
		};

		ConfigCache.subscribeToImageId = function(subscriberId, imageId, callback) {
			var data = ConfigCache.getImageRef(imageId);

			if (data) {
				if (data.loaded) {
					callback(imageId, data);
				}
			}

			ConfigCache.registerImageSub(subscriberId, imageId, callback);
		};

		ConfigCache.imageDataLoaded = function(id) {
			ConfigCache.notifyUrlReceived(ConfigCache.getImageRef(id).url);
			if (!imageSubs[id]) return;
			for (var sub  in imageSubs[id]) {
				imageSubs[id][sub](id, ConfigCache.getImageRef(id))
			}
		};

		ConfigCache.notifyLoadStateChange = function() {
			for (var i = 0; i < progressCallbacks.length; i++) {
				progressCallbacks[i](requestedUrls.length, remainingUrls.length, loadedUrls.length, remainingUrls)
			}
		//	console.log("CacheState, Requested:", requestedUrls.length, "Remaining:",remainingUrls.length, "Loaded:",loadedUrls.length)
		};

		ConfigCache.notifyUrlReadRequest = function(url) {
			if (requestedUrls.indexOf(url) == -1) {
				requestedUrls.push(url);
				remainingUrls.push(url);
				ConfigCache.notifyLoadStateChange();
			}

		};

		ConfigCache.notifyUrlReceived = function(url) {
			if (remainingUrls.indexOf(url) != -1) {
				remainingUrls.splice(remainingUrls.indexOf(url), 1);
			}

			if (loadedUrls.indexOf(url) == -1) {
				loadedUrls.push(url);

			}
			ConfigCache.notifyLoadStateChange();
		};


		ConfigCache.cacheFromUrl = function(url, success, fail) {
			ConfigCache.notifyUrlReadRequest(url);
			var onLoaded = function(remoteUrl, data) {
				ConfigCache.notifyUrlReceived(remoteUrl);
				configs.urls[remoteUrl] = data;
				for (var i = 0; i < data.length; i++) {
					for (var key in data[i]) {
						ConfigCache.dataCombineToKey(key, url, data[i]);
					}
				}
				success(remoteUrl, data)
			};
			GameDataPipeline.loadConfigFromUrl(url, onLoaded, fail);
		};

		ConfigCache.cloneCachedEntity = function(entityName, callback) {
			gooEntityCache.cloneEntity(entityName, callback);
		};

		ConfigCache.reloadEnvironmentEntity = function(entityName, callback) {
			gooEntityCache.reloadEnvironment(entityName, callback);
		};

		ConfigCache.cacheGooBundleFromUrl = function(path, goo, bundleConf, success, fail, notifyLoaderProgress) {
			ConfigCache.notifyUrlReadRequest(path+bundleConf.folder);
			var entitiesCached = function(srcKey, entities) {
				success(srcKey, entities);
			};

			var onLoaded = function(remoteUrl, data, loader) {
				console.log("Bundle Url: ", remoteUrl)
				ConfigCache.notifyUrlReceived(remoteUrl);
				ConfigCache.dataCombineToKey('bundles', bundleConf.id, data, loader);
				gooEntityCache.cacheLoadedEntities(goo, bundleConf, data, loader, entitiesCached, fail, notifyLoaderProgress)
			};

			GameDataPipeline.loadGooBundleFromUrl(path, goo, path+bundleConf.folder, bundleConf.file, onLoaded, fail);
		};

		ConfigCache.cacheSvgFromUrl = function(url, success, fail) {
			ConfigCache.notifyUrlReadRequest(url);
			var onLoaded = function(remoteUrl, svgData) {
				success(remoteUrl, svgData)
			};

			GameDataPipeline.loadSvgFromUrl(url, onLoaded, fail);
		};

		ConfigCache.cacheImageFromUrl = function(url, success, fail) {
			ConfigCache.notifyUrlReadRequest(url);
			var onLoaded = function(remoteUrl, svgData) {
				success(remoteUrl, svgData)
			};

			GameDataPipeline.loadImageFromUrl(url, onLoaded, fail);
		};


		ConfigCache.loadBundleMaster = function(path, goo, masterUrl, assetUpdated, fail, notifyLoaderProgress) {
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
				ConfigCache.cacheGooBundleFromUrl(window.resourcePath, goo,next, success, cacheFail, notifyLoaderProgress)
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

		ConfigCache.combineEntities = function(entityList, combineDone) {
			gooEntityCache.runCombinerOnList(entityList, combineDone);
		};

		ConfigCache.getCachedConfigs = function() {
			return configs;
		};


		return ConfigCache;
	});