import axios from 'axios';
import CONFIG from '../config/app.config';
import iView from 'iview';
//import loading from '@components/loading'

const Interceptor = {
	// 对请求数据做些什么
	request() {
		if (!String.prototype.trim) {
			String.prototype.trim = function () {
				return this.replace(/^\s+|\s+$/g, '');
			};
		}
		let clearNoneValueObj = (obj) => {
			for (var i in obj) {
				if (angular.isObject(obj[i])) {
					clearNoneValueObj(obj[i]);
				} else {
					typeof obj[i] == String && (obj[i] = obj[i].trim() );
					if (!obj.notClearValue && (obj[i] == undefined || obj[i] === null || obj[i] === '')) {
						delete obj[i];
					}

				}
			}
		};
		let getParams = (obj) => {
			var result = [],
				keys = Object.keys(obj);

			keys && keys.forEach(function (val) {
				var str = val + '=' + (typeof obj[val] == 'string' ? obj[val].toString() : JSON.stringify(obj[val]));
				result.push(str);
			});

			return result.join('&');
		};
		axios.interceptors.request.use(function (request) {
			iView.LoadingBar.start();

			if (CONFIG.DEV_MODE == 0) {
				request.method = 'GET';
				request.url = '/data/' + request.url + '.json?' + getParams(request.data || {});
				console.log(request)
			}else if (CONFIG.DEV_MODE == 1 && request.method == 'POST') {
				request.url =  'gateway/call/' + request.url;
			}
			clearNoneValueObj(request);
			console.log(request);
			return request;
		}, function (error) {
			return Promise.reject(error);
		})
	},
	// 对响应数据做点什么
	response() {
		axios.interceptors.response.use(function (response) {
			iView.LoadingBar.finish();

			if (response.data) {
				if (response.data.code == 'SUCCESS' || response.data.code == '0') {
					return response.data;
				} else if (response.data.code == 'SESSION_EXPIRED' || response.data.code == '5000') {
					return Promise.reject(response);
				}
			}
			return response;
		}, function (error) {
			// 对响应错误做点什么
			return Promise.reject(error);
		})
	},
	init(){
		this.request();
		this.response();
	}
};
export default Interceptor;