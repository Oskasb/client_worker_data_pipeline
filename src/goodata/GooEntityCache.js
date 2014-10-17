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

			for (var index in loaderData) {

				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					console.log("Wanted entity found: ",bundleConf, entry);
					this.cachedEntities[entry.name] = entry;
				}

			}

		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
