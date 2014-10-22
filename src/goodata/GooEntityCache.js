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

		GooEntityCache.prototype.preloadEntity = function(goo, entity, bundleConf, sourceData, success, cloneIt) {

			var preloadDoneCallback = function(ent, gooConf, sourceConf) {
				success(ent.name, {conf:gooConf, sourceData:sourceConf, build:cloneIt})
			};

			var world = goo.world;
			var transformSystem = world.getSystem('TransformSystem');
			var cameraSystem = world.getSystem('CameraSystem');
			var boundingSystem = world.getSystem('BoundingUpdateSystem');
			var animationSystem = world.getSystem('AnimationSystem');
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = goo.renderer;

			var precompedShader = function() {
				return renderer.preloadMaterials([entity]).then(preloadedMats);
			};

			var preloadedMats = function() {
			//	entity.removeFromWorld();
				world.processEntityChanges();
				preloadDoneCallback(entity, bundleConf, sourceData);
			};

			if (!entity.meshRendererComponent) {
				console.log("No entity.meshRendererComponent...", entity);
				entity.addToWorld();
				world.processEntityChanges();
				transformSystem._process();
				cameraSystem._process();
				boundingSystem._process();
				var removeIt = function() {
					entity.removeFromWorld();
				};

				renderer.precompileShaders([entity], renderSystem.lights).then(precompedShader).then(removeIt);


			//	preloadDoneCallback(entity, bundleConf, sourceData);
			} else {
		//		entity.meshRendererComponent.cullMode = 'Never';
		//		entity.addToWorld();
				world.processEntityChanges();
				transformSystem._process();
				cameraSystem._process();
				boundingSystem._process();
				renderer.precompileShaders([entity], renderSystem.lights).then(precompedShader);
			}
		};


		GooEntityCache.prototype.returnBuiltEntity = function(id, entity, loader, goo, sourceData, success, fail) {

			var cloneEntityName = function(conf, cb) {
				loader.load(conf.id).then(function(res) {
					cb(res)
				});
			};

			var cloneIt = function(entityName, callback) {
				cloneEntityName(this.cachedEntities[entityName], callback);
			}.bind(this);

			console.log("Wanted entity cached: ", entity);



			this.preloadEntity(goo, entity, this.cachedEntities[entity.name], sourceData, success, cloneIt)

		};

		GooEntityCache.prototype.cacheLoadedEntities = function(goo, bundleConf, loaderData, loader, success, fail, notifyLoaderProgress) {
			console.log("Bundle down: ", bundleConf, loaderData, loader);

			var progressUpdate = function(handled, refCount) {
				notifyLoaderProgress(handled, refCount);
				console.log("Progress: ", handled, refCount);
			};

			for (var index in loaderData) {

				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					var entityBuilt = function(id, res, dynamicLoader) {
						this.returnBuiltEntity(id, res, dynamicLoader, goo, bundleConf, success, fail);
					}.bind(this);

					this.cachedEntities[entry.name] = entry;
					loader.load(entry.id, {preloadBinaries:true, progressCallback:progressUpdate})
						.then(function(res) {

						entityBuilt(entry.id, res, loader);

					}).then(null, function (e) {
							// If something goes wrong, 'e' is the error message from the engine.
							fail('Failed to load bundle: ' + e);
						})
									}
			}
		};

		GooEntityCache.prototype.getCachedObjectByName = function(name) {

		};


		return GooEntityCache;
	});
