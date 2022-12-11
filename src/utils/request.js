const axios = require('axios')
const service = axios.create({
	timeout: 15000
})

service.interceptors.request.use(function (config) {
	return config
}, function (error) {
	return Promise.reject(error)
})

service.interceptors.response.use(
	async response => {
		if (response.status === 200) {
			return Promise.resolve(response.data)
		} else {
			return Promise.reject(response.data)
		}
	},
	async error => {
		logger.trace(error)
		if (error && error.response) {
			return Promise.reject(error.response.data)
		} else {
			return Promise.reject(new Error('请求失败'))
		}
	}
)

// 处理get请求
const Get = (url, params, config = {}) => service.get(url, params, config)
// 处理delete请求，为了防止和关键词delete冲突，方法名定义为gitDel
const Del = (url, params, config = {}) => service.delete(url, params, config)
// 处理post请求
const Post = (url, query, config = {}) => service.post(url, query, config)
// 处理put请求
const Put = (url, params, config = {}) => service.put(url, params, config)
// 处理patch请求
const Patch = (url, params, config = {}) => service.patch(url, params, config)

module.exports = {
	service,
	Get,
	Del,
	Put,
	Post,
	Patch
}