var baseUrl = '../../../../';

var MainWorker;

importScripts(baseUrl+'js/lib/require.js');

require({
		baseUrl: baseUrl+"js/"
	},
	['io/pipeline/worker/WorkerDataLoader'],
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

		MainWorker = new WorkerMain();

		console.log("Worker Require Loaded OK!")
	}
);

var handleMessage = function(oEvent) {

	if (!MainWorker) {
		console.log("MainWorker not yet ready: ", oEvent);
		setTimeout(function() {
			handleMessage(oEvent);
		}, 50);
		return;
	}

	if (oEvent.data[0] == 'json') {
		MainWorker.setupJsonRequest(oEvent.data[1]);
	}

	if (oEvent.data[0] == 'svg') {
		MainWorker.setupSvgRequest(oEvent.data[1]);
	}
};

onmessage = function (oEvent) {
	handleMessage(oEvent);
};