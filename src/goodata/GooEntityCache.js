define([
	'goo/entities/EntityUtils'

],
	function(
		EntityUtils
		) {
		"use strict";

		var goo;

		var GooEntityCache = function() {
		    this.cachedEntities = {};
		};

		GooEntityCache.prototype.preloadEntityData = function(entity, callback) {

			var world = goo.world;
			var transformSystem = world.getSystem('TransformSystem');
			var cameraSystem = world.getSystem('CameraSystem');
			var boundingSystem = world.getSystem('BoundingUpdateSystem');
			var animationSystem = world.getSystem('AnimationSystem');
			var renderSystem = world.getSystem('RenderSystem');
			var renderer = goo.renderer;

			var processCount = 0;
			var doneCount = 0;

			var handleTraversed = function(child) {

				if (child.meshRendererComponent) {
					console.log("preprocess child:", child);
					processCount++;
					var precompedShader = function() {
						return renderer.preloadMaterials([child]).then(preloadedMats);
					};

					var preloadedMats = function() {
						world.processEntityChanges();
						processCount--;
						if (processCount == 0) {
							doneCount++;
							callback();

						}
					};

					world.processEntityChanges();
					transformSystem._process();
					cameraSystem._process();
					boundingSystem._process();
					animationSystem._process();
					renderer.precompileShaders([child], renderSystem.lights).then(precompedShader);
				}

			};

			if (typeof(entity.traverse) == 'function') {
				entity.traverse(handleTraversed);

				if (doneCount == 0 && processCount == 0) {
					console.error("Traversed entity and found zero mesh renderer comps..", entity);
					callback();
				}
			} else {
				callback();
			}
		};

		GooEntityCache.prototype.preloadEntity = function(entity, bundleConf, sourceData, success, cloneIt) {

			var preloadDoneCallback = function(ent, gooConf, sourceConf) {
				success(ent.name, {conf:gooConf, sourceData:sourceConf, build:cloneIt})
			};

			var preProcessingDone = function() {
				preloadDoneCallback(entity, bundleConf, sourceData);
			};

			this.preloadEntityData(entity, preProcessingDone)
		};


		GooEntityCache.prototype.returnBuiltEntity = function(id, entity, loader, sourceData, success, fail) {

			var cloneEntityName = function(conf, cb) {



				loader.load(conf.id, null).then(function(res) {
						cb(EntityUtils.clone(goo.world, res));
					console.log("some stuff?:",stuff);
				});


			};

			var cloneIt = function(entityName, callback) {
				cloneEntityName(this.cachedEntities[entityName], callback);
			}.bind(this);

			console.log("Wanted entity cached: ", entity);
			this.preloadEntity(entity, this.cachedEntities[entity.name], sourceData, success, cloneIt)

		};

		GooEntityCache.prototype.cacheLoadedEntities = function(gooRunner, bundleConf, loaderData, loader, success, fail, notifyLoaderProgress) {
			goo = gooRunner;

			console.log("Bundle down: ", bundleConf, loaderData, loader);

			var progressUpdate = function(handled, refCount) {
				notifyLoaderProgress(handled, refCount);
				console.log("Progress: ", handled, refCount);
			};

			for (var index in loaderData) {

				var entry = loaderData[index];
				if (bundleConf.entities.indexOf(entry.name) != -1) {

					var entityBuilt = function(id, res, dynamicLoader) {
						this.returnBuiltEntity(id, res, dynamicLoader, bundleConf, success, fail);
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
