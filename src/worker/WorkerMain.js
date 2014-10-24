var baseUrl = '../../../../../';

var MainWorker;

importScripts(baseUrl+'js/lib/require.js');
importScripts(baseUrl+'js/lib/goo/goo.js');

require.config({
	baseUrl: baseUrl+'js/',
	paths: {
		data_pipeline:'submodules/data_pipeline/src'
	}
});


require(
	['data_pipeline/worker/WorkerDataLoader'],
	function(WorkerDataLoader) {

		var WorkerMain = function() {
			this.workerDataLoader = new WorkerDataLoader();
		};

		WorkerMain.prototype.setupJsonRequest = function(url) {
			this.workerDataLoader.fetchJsonData(url)
		};

		WorkerMain.prototype.setupSvgRequest = function(url) {
			this.workerDataLoader.fetchSvgData(url);
		};

		WorkerMain.prototype.setupBinaryRequest = function(url) {
			this.workerDataLoader.fetchBinaryData(url);
		};

		MainWorker = new WorkerMain();

		console.log("Worker Require Loaded OK!")
	}
);

var handleMessage = function(oEvent) {

	if (!MainWorker) {
		console.log("MainWorker not yet ready: ", oEvent);
		setTimeout(function() {
			handleMessage(oEvent);
		}, 250);
		return;
	}

	if (oEvent.data[0] == 'json') {
		MainWorker.setupJsonRequest(oEvent.data[1]);
	}

	if (oEvent.data[0] == 'svg') {
		MainWorker.setupSvgRequest(oEvent.data[1]);
	}

	if (oEvent.data[0] == 'bin') {
		MainWorker.setupBinaryRequest(oEvent.data[1]);
	}
};

onmessage = function (oEvent) {
	handleMessage(oEvent);
};