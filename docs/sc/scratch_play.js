$('.green-flag-box').click(function(){
	$('#container_main').hide();
	$('#loading-progress').show();
	$('#container_play').show();
	$('#greenFlag').show();
	$('#stopAll').show();

	runBenchmark();
    window.focus();
});

!function(e) {
    "use strict";
    function n() {
        this.name = "NotSupportedError",
        this.message = "getUserMedia is not implemented in this browser"
    }
    function i() {
        this.then = function() {
            return this
        };
        var i = new n;
        this.
        catch = function(e) {
            setTimeout(function() {
                e(i)
            })
        }
    }
    n.prototype = Error.prototype;
    var r = "undefined" != typeof Promise,
    t = "undefined" != typeof navigator,
    a = t && navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
    o = t && (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    function s(t) {
        return r ? a ? navigator.mediaDevices.getUserMedia(t) : new Promise(function(e, i) {
            if (!o) return i(new n);
            o.call(navigator, t, e, i)
        }) : new i
    }
    s.NotSupportedError = n,
    s.isSupported = !(!r || !a && !o),
    "function" == typeof define && define.amd ? define([],
    function() {
        return s
    }) : "object" == typeof module && module.exports ? module.exports = s: (e.navigator || (e.navigator = {}), e.navigator.mediaDevices || (e.navigator.mediaDevices = {}), e.navigator.mediaDevices.getUserMedia || (e.navigator.mediaDevices.getUserMedia = s))
} (this);

const requestStack = [];
const requestVideoStream = videoDesc => {
    let streamPromise;
    if (requestStack.length === 0) {
        streamPromise = navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoDesc
        });
        requestStack.push(streamPromise);
    } else if (requestStack.length > 0) {
        streamPromise = requestStack[0];
        requestStack.push(true);
    }
    return streamPromise;
};

const requestDisableVideo = () => {
    requestStack.pop();
    if (requestStack.length > 0) return false;
    return true;
};

WIDTH = 480;
HEIGHT = 360;
class VideoProvider {
    constructor () {
        this.mirror = true;
        this._frameCacheTimeout = 16;
        this._video = null;
        this._track = null;
        this._workspace = [];
    }

    static get FORMAT_IMAGE_DATA () {return 'image-data';}
    static get FORMAT_CANVAS () {return 'canvas';}
    static get DIMENSIONS () {return [WIDTH, HEIGHT];}
    static get ORDER () { return 1; }
    get video () { return this._video; }

    enableVideo () { this.enabled = true; return this._setupVideo(); }
    disableVideo () {
        this.enabled = false;
        if (this._singleSetup) {
            this._singleSetup
                .then(this._teardown.bind(this))
                .catch(err => this.onError(err));
        }
    }
    _teardown () {
        if (this.enabled === false) {
            const disableTrack = requestDisableVideo();
            this._singleSetup = null;
            this._video = null;
            if (this._track && disableTrack) {
                this._track.stop();
            }
            this._track = null;
        }
    }
    getFrame ({
        dimensions = VideoProvider.DIMENSIONS,
        mirror = this.mirror,
        format = VideoProvider.FORMAT_IMAGE_DATA,
        cacheTimeout = this._frameCacheTimeout
    }) {
        if (!this.videoReady) {
            return null;
        }
        const [width, height] = dimensions;
        const workspace = this._getWorkspace({dimensions, mirror: Boolean(mirror)});
        const {videoWidth, videoHeight} = this._video;
        const {canvas, context, lastUpdate, cacheData} = workspace;
        const now = Date.now();

        if (lastUpdate + cacheTimeout < now) {

            if (mirror) {
                context.scale(-1, 1);
                context.translate(width * -1, 0);
            }

            context.drawImage(this._video,
                0, 0, videoWidth, videoHeight,
                0, 0, width, height
            );

            context.setTransform(1, 0, 0, 1, 0, 0);
            workspace.lastUpdate = now;
        }

        if (!cacheData[format]) {
            cacheData[format] = {lastUpdate: 0};
        }
        const formatCache = cacheData[format];

        if (formatCache.lastUpdate + cacheTimeout < now) {
            if (format === VideoProvider.FORMAT_IMAGE_DATA) {
                formatCache.lastData = context.getImageData(0, 0, width, height);
            } else if (format === VideoProvider.FORMAT_CANVAS) {
                formatCache.lastUpdate = Infinity;
                formatCache.lastData = canvas;
            } else {
                console.error(`video io error - unimplemented format ${format}`);
                formatCache.lastUpdate = Infinity;
                formatCache.lastData = null;
            }

            formatCache.lastUpdate = Math.max(workspace.lastUpdate, formatCache.lastUpdate);
        }

        return formatCache.lastData;
    }
    onError (error) { console.error('Unhandled video io device error', error); }
    _setupVideo () {
        if (this._singleSetup) {
            return this._singleSetup;
        }

        this._singleSetup = requestVideoStream({
            width: {min: WIDTH, ideal: 480 * WIDTH / HEIGHT},
            height: {min: HEIGHT, ideal: 480}
        })
            .then(stream => {
                this._video = document.createElement('video');

                try {
                    this._video.srcObject = stream;
                } catch (error) {
                    this._video.src = window.URL.createObjectURL(stream);
                }
                this._video.play();
                this._track = stream.getTracks()[0];
                return this;
            })
            .catch(error => {
                this._singleSetup = null;
                this.onError(error);
            });

        return this._singleSetup;
    }

    get videoReady () {
        if (!this.enabled) {
            return false;
        }
        if (!this._video) {
            return false;
        }
        if (!this._track) {
            return false;
        }
        const {videoWidth, videoHeight} = this._video;
        if (typeof videoWidth !== 'number' || typeof videoHeight !== 'number') {
            return false;
        }
        if (videoWidth === 0 || videoHeight === 0) {
            return false;
        }
        return true;
    }

    _getWorkspace ({dimensions, mirror}) {
        let workspace = this._workspace.find(space => (
            space.dimensions.join('-') === dimensions.join('-') &&
            space.mirror === mirror
        ));
        if (!workspace) {
            workspace = {
                dimensions,
                mirror,
                canvas: document.createElement('canvas'),
                lastUpdate: 0,
                cacheData: {}
            };
            workspace.canvas.width = dimensions[0];
            workspace.canvas.height = dimensions[1];
            workspace.context = workspace.canvas.getContext('2d');
            this._workspace.push(workspace);
        }
        return workspace;
    }
}


//运行Scratch
const runBenchmark = function () {
    const vm = new window.NotVirtualMachine();

    const canvas = document.getElementById('stage');
    const renderer = new window.ScratchRender(canvas );
    vm.attachRenderer(renderer);

    const storage = new ScratchStorage();
    vm.attachStorage(storage);

    const audioEngine = new window.AudioEngine();
    vm.attachAudioEngine(audioEngine);
    vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
    vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());

    let initialized = false;
    vm.on('workspaceUpdate', () => {
        if (initialized) return;
        vm.setVideoProvider(new VideoProvider());

        vm.setCompatibilityMode(true);
        vm.greenFlag();
        initialized = true;
    });

    const question = document.getElementById('question');
    const askBox = document.getElementById('answer');
    askBox.addEventListener('keydown', e => {
        if (e.keyCode === 13) {
            document.body.classList.remove('asking');
            /* submit answer after because it starts the next question synchronously */
            vm.runtime.emit('ANSWER', askBox.value);
        }
    });
    vm.runtime.addListener('QUESTION', questionData => {
        /* null means the asking was interrupted by stop script block */
        console.log(questionData)
        if (questionData === null) {
            document.body.classList.remove('asking');
        } else {
            document.body.classList.add('asking');
            question.textContent = questionData;
            askBox.value = '';
            askBox.focus();
        }
    });

    const monitorWrapper = document.getElementById('monitors');
    const getVariable = (targetId, variableId) => {
        const target = targetId ?
            vm.runtime.getTargetById(targetId) :
            vm.runtime.getTargetForStage();
        return target.variables[variableId];
    };
    const monitorStates = {};
    vm.runtime.addListener('MONITORS_UPDATE', monitors => {
        monitors.forEach((record, id) => {
            if (!monitorStates[id]) {
                const monitor = document.createElement('div');
                monitor.className = 'monitor ' + record.mode;
                monitor.style.left = record.x + 'px';
                monitor.style.top = record.y + 'px';
                if (record.mode === 'list') {
                    monitor.style.width = record.width + 'px';
                    monitor.style.height = record.height + 'px';
                }
                const label = document.createElement('span');
                label.className = 'monitor-label';
                let name = record.params.VARIABLE || record.params.LIST || record.opcode;
                if (record.spriteName) name = `${record.spriteName}: ${name}`;
                label.textContent = name;
                monitor.appendChild(label);
                const value = document.createElement('span');
                value.className = 'monitor-value';
                monitor.appendChild(value);
                monitorStates[id] = {monitor, value};
                if (record.mode === 'slider') {
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = record.sliderMin;
                    slider.max = record.sliderMax;
                    slider.step = record.isDiscrete ? 1 : 0.01;
                    slider.addEventListener('input', e => {
                        getVariable(record.targetId, id).value = slider.value;
                    });
                    slider.addEventListener('change', e => {
                        getVariable(record.targetId, id).value = slider.value;
                    });
                    monitorStates[id].slider = slider;
                    monitor.appendChild(slider);
                }
                monitorWrapper.appendChild(monitor);
            }
            monitorStates[id].monitor.style.display = record.visible ? null : 'none';
            if (record.visible) {
                let value = record.value;
                if (typeof value === 'number') {
                    value = Number(value.toFixed(6));
                }
                if (typeof value === 'boolean') {
                    value = value.toString();
                }
                if (Array.isArray(value)) {
                    if (monitorStates[id].lastValue === JSON.stringify(value)) return;
                    monitorStates[id].value.innerHTML = '';
                    value.forEach(val => {
                        const row = document.createElement('div');
                        row.className = 'row';
                        row.textContent = val;
                        monitorStates[id].value.appendChild(row);
                    });
                } else {
                    monitorStates[id].value.textContent = value;
                    if (monitorStates[id].slider) monitorStates[id].slider.value = value;
                }
            }
        });
    });
    vm.start();
};
