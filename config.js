/**
 * @name: 打包脚本关联远程分支
 */

module.exports = {
    production: {
      github: {
        url: 'https://github.com/Yangqi0604/vue3.0.git',
        branch: 'build-production'
      }
    },
  
    test: {
      github: {
        url: 'https://github.com/Yangqi0604/vue3.0.git',
        branch: 'build-test'
      }
    }
  }
  