(function (doc, win) {
    let docEl = win.document.documentElement;
    let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    let metaEl = doc.querySelector('meta[name="viewport"]');
    let dpr = 0;
    let scale = 0;

    // 对iOS设备进行dpr的判断，对于Android系列，始终认为其dpr为1
    if (!dpr && !scale) {
        let isAndroid = win.navigator.appVersion.match(/android/gi);
        let isIPhone = win.navigator.appVersion.match(/[iphone|ipad]/gi);
        let devicePixelRatio = win.devicePixelRatio;

        if (isIPhone) {
            dpr = devicePixelRatio;
        } else {
            dpr = 1;
        }

        scale = 1 / dpr;
    }

    /**
     * ================================================
     *   设置data-dpr和viewport
     × ================================================
     */

    docEl.setAttribute('data-dpr', dpr);
    // 动态改写meta:viewport标签
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'width=device-width, initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        document.documentElement.firstElementChild.appendChild(metaEl);
    } else {
        metaEl.setAttribute('content', 'width=device-width, initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    }

})(document, window);