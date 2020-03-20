const pathFn = require('path')
const swig = require('swig')
const util = require('hexo-util')
const env = process.env.NODE_ENV || 'test'
const config = require('./config')[env]
const dayjs = require('dayjs')
const ora = require('ora')
const spawn = util.spawn
const deployDir = pathFn.resolve(__dirname, './dist')

const message = swig.compile("Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}")({
  now: function (format) {
    return dayjs().format(format)
  }
})

function clear () {
  return spawn('rm', ['-rf', deployDir]).then(() => spawn('mkdir', ['dist']))
}

function build () {
  return spawn('npm', ['run', `build:${env}`])
}
function git () {
  const len = arguments.length
  const args = new Array(len)

  for (let i = 0; i < len; i++) {
    args[i] = arguments[i]
  }

  return spawn('git', args, {
    cwd: deployDir
  })
}

function setup () {
  return git('init')
    .then(function () {
      return git('add', '-A')
    })
    .then(function () {
      return git('commit', '-m', message)
    })
}

function push (repo) {
  return git('add', '-A')
    .then(function (msg) {
      console.log(msg)
      return git('commit', '-m', message).catch(function () {})
    })
    .then(function () {
      return git('push', '-u', repo.url, 'master:' + repo.branch, '--force')
    })
}

function main () {
  let spinner = ora().start('移除编译源目录')

  let spinnerInfo = text =>
    new Promise(resolve => {
      setTimeout(() => {
        spinner.text = text
        resolve()
      }, 500)
    })

  clear()
    .then(() => spinnerInfo('打包...'))
    .then(() => build())
    // .then(() => copyBuidlerConf())
    .then(() => spinnerInfo('打包成功！'))
    .then(() => spinnerInfo('初始化GitHub'))
    .then(() => setup())
    .then(() =>
      spinnerInfo(`上传代码:【${config.github.url}】：${config.github.branch}`)
    )
    .then(() => push(config.github))
    .then(() =>
      spinner.succeed(`上传成功！${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
    )
    .then(() => spawn('rm', ['-rf', deployDir]))
}

main()
