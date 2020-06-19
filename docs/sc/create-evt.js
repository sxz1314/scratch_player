// 摄像头相关
function requestVideoStream(videoDesc) {
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
// 摄像头相关
function requestDisableVideo() {
    requestStack.pop();
    if (requestStack.length > 0) return false;
    return true;
};

// 设置rem
function fnResize() {
    var deviceWidth = document.documentElement.clientWidth || window.innerWidth
    if (deviceWidth >= 750) {   // 1rem = 100px
        deviceWidth = 750
    }
    if (deviceWidth <= 320) {   // 1rem = 50px
        deviceWidth = 320
    }
    //设置rem大小
    document.documentElement.style.fontSize = (deviceWidth / 7.5) + 'px'
}

/*
 * 给元素添加事件（用来触发键盘事件）
 * el模拟事件的触发元素，evtType事件类型，keycode对应的键盘事件的键值,key对应事件所触发的键名,
 */
function createKeyEvent(el, evtType, keyCode ,key) {
    var doc = el.ownerDocument,
        win = doc.defaultView || doc.parentWindow,
        evtObj;
    if(doc.createEvent){
        if(win.KeyEvent) {
            evtObj = doc.createEvent('KeyEvents');
            evtObj.initKeyEvent( evtType, true, true, win, false, false, false, false, keyCode, 0 );
        }
        else {
            evtObj = doc.createEvent('UIEvents');
            Object.defineProperty(evtObj, 'keyCode', {
                get : function() { return this.keyCodeVal; }
            });
            Object.defineProperty(evtObj, 'which', {
                get : function() { return this.keyCodeVal; }
            });
            evtObj.initUIEvent( evtType, true, true, win, 1 );
            evtObj.key = key;
            evtObj.keyCodeVal = keyCode;
            if (evtObj.keyCode !== keyCode) {
                console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
            }
        }
        el.dispatchEvent(evtObj);
    }
    else if(doc.createEventObject){
        evtObj = doc.createEventObject();
        evtObj.keyCode = keyCode;
        el.fireEvent('on' + evtType, evtObj);
    }
};

/*
 * 给数组元素批量添加事件（用来触发键盘事件）
 */
function batchAddEvent(el,list) {
    list = list || [];
    if(!Array.isArray(list)) return false;
    for(let i=0,len=list.length;i<len;i++){
        // PC端绑定点击事件触发键盘事件
        // list[i].obj.onclick = function () {
        //     createKeyEvent(el, 'keydown', list[i].keyCode , list[i].key);
        // }
        // 移动端需要按下抬起两个动作 touchstart触发keydpown  touchend触发keyup
        list[i].obj.addEventListener("touchstart",(e) => {
            e.preventDefault()
            list[i].obj.classList.add("active")
            createKeyEvent(el, 'keydown', list[i].keyCode , list[i].key);
        });
        list[i].obj.addEventListener("touchend",(e) => {
            e.preventDefault()
            list[i].obj.classList.remove("active")
            createKeyEvent(el, 'keyup', list[i].keyCode , list[i].key);
        });
    }
};


function bindkeys() {
    const space = document.querySelector('#space');
    const up = document.querySelector('#up');
    const down = document.querySelector('#down');
    const left = document.querySelector('#left');
    const right = document.querySelector('#right');
    // 需要模拟键盘操控的区域
    const canvas = document.getElementById('ocanvas');

    // 如果你需要添加事件的元素比较多。可以使用index.js里面的 batchAddEvent方法 批量绑定
    let aele = [
        {
            obj: space,
            keyCode: 32,
            key: " "
        },
        {
            obj: down,
            keyCode: 40,
            key: "ArrowDown"
        },
        {
            obj: left,
            keyCode: 37,
            key: "ArrowLeft"
        },
        {
            obj: right,
            keyCode: 39,
            key: "ArrowRight"
        },
        {
            obj: up,
            keyCode: 38,
            key: "ArrowUp"
        }
    ];
    batchAddEvent(canvas,aele)
}

// 绑定鼠标事件
function attachMouseEvents(canvas) {
    document.addEventListener('mousemove', (e) => {onMouseMove(e,canvas)});
    document.addEventListener('mouseup', (e) => {onMouseUp(e,canvas)});
    document.addEventListener('touchmove', (e) => {onMouseMove(e,canvas)});
    document.addEventListener('touchend', (e) => {onMouseUp(e,canvas)});
    canvas.addEventListener('mousedown', (e) => onMouseDown(e,canvas));
    canvas.addEventListener('touchstart', (e) => onMouseDown(e,canvas));
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown (e) {
    // 源码 为了增加模拟键盘事件暂时删掉
    // if (e.target !== document && e.target !== document.body) return;
    
    const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
    vm.postIOData('keyboard', {
        key: key,
        isDown: true
    });

    if (e.keyCode === 32 || // 32=space
        (e.keyCode >= 37 && e.keyCode <= 40)) { // 37, 38, 39, 40 are arrows
        e.preventDefault();
    }
}

function handleKeyUp (e) {
    const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
    vm.postIOData('keyboard', {
        key: key,
        isDown: false
    });

    // E.g., prevent scroll.
    if (e.target !== document && e.target !== document.body) {
        e.preventDefault();
    }
}

function onMouseMove(e,canvas) {
    const { x, y } = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    const mousePosition = [x - rect.left, y - rect.top];

    if (state.mouseDown && !state.isDragging) {
        const distanceFromMouseDown = Math.sqrt(
            Math.pow(mousePosition[0] - state.mouseDownPosition[0], 2) +
            Math.pow(mousePosition[1] - state.mouseDownPosition[1], 2)
        );
        // if (distanceFromMouseDown > dragThreshold) { // const dragThreshold = 3;
        if (distanceFromMouseDown > 3) {
            cancelMouseDownTimeout();
            onStartDrag(...state.mouseDownPosition);
        }
    }

    if (state.mouseDown && state.isDragging) {
        const spritePosition = getScratchCoords(mousePosition[0], mousePosition[1], canvas);
        vm.postSpriteInfo({
            x: spritePosition[0] + state.dragOffset[0],
            y: -(spritePosition[1] + state.dragOffset[1]),
            force: true
        });
    }
    const coordinates = {
        x: mousePosition[0],
        y: mousePosition[1],
        canvasWidth: rect.width,
        canvasHeight: rect.height
    };
    vm.postIOData('mouse', coordinates);
}

function onMouseUp(e,canvas) {
    const { x, y } = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    const mousePosition = [x - rect.left, y - rect.top];
    cancelMouseDownTimeout();
    state['mouseDown'] = false;
    state['mouseDownPosition'] = null;
    const data = {
        isDown: false,
        x: mousePosition[0],
        y: mousePosition[1],
        canvasWidth: rect.width,
        canvasHeight: rect.height,
        wasDragged: state.isDragging
    };
    if (state.isDragging) {
        onStopDrag(mousePosition[0], mousePosition[1]);
    }
    vm.postIOData('mouse', data);
}

function onMouseDown(e,canvas) {
    const { x, y } = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    const mousePosition = [x - rect.left, y - rect.top];
    if (e.button === 0 || (window.TouchEvent && e instanceof TouchEvent)) {
        state['mouseDown'] = true;
        state['mouseDownPosition'] = mousePosition;
    }
    const data = {
        isDown: true,
        x: mousePosition[0],
        y: mousePosition[1],
        canvasWidth: rect.width,
        canvasHeight: rect.height
    };

    vm.postIOData('mouse', data);
    if (e.preventDefault) {
        e.preventDefault();
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    }
}

function cancelMouseDownTimeout() {
    if (state.mouseDownTimeoutId !== null) {
        clearTimeout(state.mouseDownTimeoutId);
    }
    state['mouseDownTimeoutId'] = null;
}

function onStartDrag(x, y) {
    if (state.dragId) return;
    const drawableId = render.pick(x, y);
    if (drawableId === null) return;
    const targetId = vm.getTargetIdForDrawableId(drawableId);
    if (targetId === null) return;
    const target = vm.runtime.getTargetById(targetId);
    if (!target.draggable) return;
    target.goToFront();
    const drawableData = render.extractDrawable(drawableId, x, y);
    vm.startDrag(targetId);
    state['isDragging'] = true;
    state['dragId'] = targetId;
    state['dragOffset'] = drawableData.scratchOffset;
}

function onStopDrag(mouseX, mouseY) {
    const dragId = state.dragId;
    const commonStopDragActions = () => {
        vm.stopDrag(dragId);
        state['isDragging'] = false;
        state['dragOffset'] = null;
        state['dragId'] = null;
    };
    commonStopDragActions();
}

function getScratchCoords(x, y, canvas) {
    const nativeSize = render.getNativeSize();
    const rect = canvas.getBoundingClientRect();
    return [
        (nativeSize[0] / rect.width) * (x - (rect.width / 2)),
        (nativeSize[1] / rect.height) * (y - (rect.height / 2))
    ];
}

// 本地读取sb*文件(sb3)
function readFromSb(targert) {
    const reader = new FileReader();
    reader.onload = () => {
        vm.start();
        vm.setCompatibilityMode(true);
        vm.setTurboMode(false);
        vm.loadProject(reader.result)
            .then(() => {
                // vm.greenFlag();
            });
    };
    reader.readAsArrayBuffer(targert);
}

function fetchScratchFile(fileName = getQueryString('file')) {
    const path = fileName;
    if (path) {
        axios.get(path, {
            responseType: 'blob'
        })
            .then((res) => {
                readFromSb(res.data)
            })
    }
}

function start() {
    vm.greenFlag();
}

function stop() {
    vm.stopAll();
}

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
    
    fnResize();
    window.onresize = function () {
        fnResize()
    }
    // 解决移动端（ios）input触发弹出软键盘页面不滑动问题
    document.getElementById("answer").onblur = function() {
        window.scroll(0,0);
    }
} (this);
