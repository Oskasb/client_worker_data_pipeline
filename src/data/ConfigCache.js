"use strict";

define(['io/pipeline/GameDataPipeline'],
	function(
		GameDataPipeline
		) {
		var configs = {};
		var categories = {};
		var images = {};
		var imageSubs = {};
		var masterReset = function() {};

		var gameDataPipeline = new GameDataPipeline();

		var ConfigCache = function() {

		};

		var options = {
			pollData:true
		};

		ConfigCache.setDataPipelineOptions = function(opts) {
			for (var index in opts) {
				options[index] = opts[index];
			}
		};

		ConfigCache.checkPolling = function(activate) {
			if (options.pollData && activate) {
				return true
			}
		};

		ConfigCache.setMasterRestFunction = function(callback) {
			masterReset = callback;
		};

		ConfigCache.storeImageRef = function(id, image) {
			images[id] = image;
		};

		ConfigCache.getImageRef = function(id) {
			return images[id];
		};

		ConfigCache.addCategory = function(category) {
			configs[category] = {};
			categories[category] = {
				callbacks:[],
				oneshots:{},
				subscription:{}
			}
		};

		ConfigCache.fireCategoryCallbacks = function(key) {
			for (var i = 0; i < categories[key].callbacks.length; i++) {
				categories[key].callbacks[i](configs[key]);
			}
			for (var index in categories[key].oneshots) {
				if (configs[key][index]) {
					categories[key].oneshots[index](configs[key][index]);
				}
			}
			for (var index in categories[key].subscription) {
				if (configs[key][index]) {
					categories[key].subscription[index](configs[key][index]);
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
			configs[url] = data;
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

		ConfigCache.registerOneshotCategoryCallback = function(category, key, callback) {
			if (!categories[category]) {
				ConfigCache.addCategory(category);
			}
			categories[category].oneshots[key] = callback;

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

		};

		ConfigCache.subscribeToCategoryKey = function(category, key, callback) {
		    var data = ConfigCache.getConfigKey(category, key);
			if (typeof(data) != 'string') {
			    callback(data);
			}
			ConfigCache.registerCategoryKeySubscriber(category, key, callback);
		};


		ConfigCache.registerImageSub = function(id, callback) {
			if (!imageSubs[id]) imageSubs[id] = [];
			imageSubs[id].push(callback)
		};

		ConfigCache.subscribeToImageId = function(imageId, callback) {
			var data = ConfigCache.getImageRef(imageId);
			if (data.loaded) {
				callback(data);
			}
			ConfigCache.registerImageSub(imageId, callback);
		};

		ConfigCache.imageDataLoaded = function(id) {
			if (!imageSubs[id]) return;
			for (var i = 0; i < imageSubs[id].length; i++) {
				imageSubs[id][i].callback(ConfigCache.getImageRef(id))
			}
		};


		ConfigCache.cacheFromUrl = function(url, success, fail) {

			var onLoaded = function(remoteUrl, data) {

				for (var i = 0; i < data.length; i++) {
					for (var key in data[i]) {
						ConfigCache.dataCombineToKey(key, url, data[i]);
					}
				}

				success(remoteUrl, data)
			};

			GameDataPipeline.loadConfigFromUrl(url, onLoaded, fail, ConfigCache.checkPolling());
		};

		ConfigCache.cacheSvgFromUrl = function(url, success, fail) {

			var onLoaded = function(remoteUrl, svgData) {
				success(remoteUrl, svgData)
			};

			GameDataPipeline.loadSvgFromUrl(url, onLoaded, fail, ConfigCache.checkPolling());
		};


		ConfigCache.getCachedConfigs = function() {
			return configs;
		};

		ConfigCache.tickDataPipeline = function(tpf) {
			GameDataPipeline.tickDataLoader(tpf);
		};


		return ConfigCache;
	});