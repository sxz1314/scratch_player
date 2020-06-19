"use strict";

/**
 * @function 获取url参数
 * @param {string} name 
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

/**
 * @function 防抖函数
 * @param {function} func 
 * @param {number} delay 
 */
function debounce(func, delay) {
    var timer = null;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    }
}

/**
 * @function 监测屏幕方向
 */
function detectOrient() {
    const detectData = document.getElementById('J_detectData');
    const detectWH = document.getElementById('J_detectWH');
    const detectRes = document.getElementById('J_detectRes');
    let sw, sh;
    var storage = localStorage; // 不一定要使用localStorage，其他存储数据的手段都可以
    var data = storage.getItem('J-recordOrientX');
    var cw = document.documentElement.clientWidth;

    var _Width = 0,
        _Height = 0;
    if (!data) {
        sw = window.screen.width;
        sh = window.screen.height;
        // 2.在某些机型（如华为P9）下出现 srceen.width/height 值交换，所以进行大小值比较判断
        _Width = sw < sh ? sw : sh;
        _Height = sw >= sh ? sw : sh;
        storage.setItem('J-recordOrientX', _Width + ',' + _Height);
    } else {
        var str = data.split(',');
        _Width = str[0];
        _Height = str[1];
    }

    if (cw == _Width) {
        // 竖屏
        detectRes.innerHTML = '检测结果是竖屏';
    }
    if (cw == _Height) {
        // 横屏
        detectRes.innerHTML = '检测结果是横屏';
    }


    detectData.innerHTML = 'clientWidth；' + document.documentElement.clientWidth + ';<br>' +
        'clientHeight；' + document.documentElement.clientHeight + ';<br>' +
        'screen.width：' + window.screen.width + ';<br>' +
        'screen.height：' + window.screen.height + ';';

    if (window.screen.width > window.screen.height) {
        // canvasW = window.screen.width;
        __bbfs_scratch['canvasH'] = window.screen.height;
    } else {
        // canvasW = window.screen.height;
        __bbfs_scratch['canvasH'] = window.screen.width;

    }

    __bbfs_scratch['canvasW'] = (__bbfs_scratch['canvasH'] / 9 * 19.5).toFixed(2);

    detectWH.innerHTML = 'canvasW: ' + __bbfs_scratch['canvasW'] + ';<br>' + 'canvasH: ' + __bbfs_scratch['canvasH'];
}

/**
 * @function 重置canvas宽高
 * @param {number} _w 
 * @param {number} _h 
 */
function resizeCanvas(_w, _h) {
    canvas.style.width = _w + 'px';
    canvas.style.height = _h + 'px';
    canvas.style.marginLeft = - _w / 2 + 'px';
    canvas.style.marginTop = - _h / 2 + 'px';
}

/**
 * @function 获取事件的x,y坐标
 */
function getEventXY(e) {
    if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.changedTouches && e.changedTouches[0]) {
        return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}