define([
	'goo/entities/EntityUtils'

],
	function(
		EntityUtils
		) {
		"use strict";

		var GooEntityCache = function() {
		    this.cachedEntities = {};
		};

		GooEntityCache.prototype.cacheLoadedEntities = function(goo, bundleConf, loaderData, loader, success, fail) {
			console.log("Bundle down: ", bundleConf, loaderData, loader);
			for (var index in loaderData) {

				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					console.log("Wanted entity found: ", bundleConf, entry, loader);
					this.cachedEntities[entry.name] = entry;

					// use loader to make entity here

					success(bundleConf, EntityUtils.clone(goo.world, entry, {}))
				}

			}

		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
