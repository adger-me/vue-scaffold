/*
 * @Author: Adger
 * @Date: 2018-12-12 16:16:20
 */

import fly from 'flyio';
import md5 from 'md5';
// import store from '../store';
// store.dispatch('auth/login');

let secretKey = "IrDsQ1AmevlHVqj7XmCmhZHSpiUGePTe";
let appId = "c490841a36f0901bc0a14a4ee6473ceb";
let token = md5('token');
let timestap = Math.round(new Date().valueOf() / 1000);
let md5_str = md5(token + timestap + secretKey);

// fly.config.baseURL = '/api';
fly.config.timeout = 1000 * 30;
fly.config.withCredentials = true;
// 是否自动将'Content-Type'为'application/json'的响应数据转化为JSON对象，默认为true
fly.config.parseJson = true;
fly.config.headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'crossDomain': true,
    'system': 'web',
    'current-time': timestap,
    'encrypt-string': md5_str,
    'access-token': token,
    'appid': appId
};

/**
 * 请求拦截
 */
fly.interceptors.request.use(request => {
    if (localStorage.hasOwnProperty('access-token')) {
        request.headers['access-token'] = localStorage.getItem('access-token');
    }
    vm.$showSnake();
    return request;
});

/**
 * 响应拦截
 */
fly.interceptors.response.use(response => {
    vm.$closeSnake();
    response['data'] = JSON.parse(response['data']);
    return response
}, error => {
    if (error && error.response) {

        switch (error.response.status) {
            case 401:
                vm.$message.error('未授权，请重新登录!', () => {
                }, {delay: 1500});
                localStorage.clear();
                break;
            case 404:
                vm.$message.error('404 请求错误,未找到该资源!', () => {
                }, {delay: 1500});
                break;
            case 502:
                vm.$message.error('502 网络错误!', () => {
                }, {delay: 1500});
                break;
            case 503:
                vm.$message.error('503 服务不可用!', () => {
                }, {delay: 1500});
                break;
            case 504:
                vm.$message.error('504 网络超时求!', () => {
                }, {delay: 1500});
                break;
            case 505:
                vm.$message.error('505 http版本不支持该请求!', () => {
                }, {delay: 1500});
                break;
        }
    } else {
        vm.$message.error('连接到服务器失败!', () => {
        }, {delay: 1500});
    }
    vm.$closeSnake();
    return Promise.reject(error);
});

let HTTP = (type, url, params, config = {}) => {
    let args = [url, params, config].filter(x => Boolean(x));
    return fly[type](...args).then(res => {
            if (res.data && res.data.status !== 1) {
                vm.$message.error(res.data.msg, () => {
                }, {delay: 1500})
            }
            return res.data
        }
    )
};

export default {
    get: HTTP.bind(null, 'get'),
    post: HTTP.bind(null, 'post'),
    put: HTTP.bind(null, 'put'),
    delete: HTTP.bind(null, 'delete')
}
