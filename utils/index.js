const Spinnies = require('spinnies');
const spawn = require('cross-spawn');
const npminstall = require('npminstall');
const child_process = require('child_process');

const spinner = { interval: 160, frames: ['🍇', '🍈', '🍉', '🍋', '🚀', '🤔', '🐮'], }

/** 
* cwd : 安装的路径  
* args : npm 命令  
* log : 打印开始和结束的文字 
*/
const npmRun = (use, cwd, args, log,) => {
    // return
    try {
        const icon_arr = ['🍇', '🍈', '🍉', '🍋', '🚀', '🤔', '🐮'];
        const index = Math.round(Math.random() * icon_arr.length);
        const spinnie = new Spinnies({ spinner, succeedPrefix: icon_arr[index] });
      
        spinnie.add('npmRun', { text: log.start});
        spawn.sync(use, args, {
            cwd,
            stdio: 'inherit',
        });
        spinnie.succeed('npmRun', { text: log.end });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}

const checkYarnVersion = (use, cwd, args) => {
    try {
        const result = child_process.spawnSync(use, args)
        return result.status === 0;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}

module.exports = {
    npmRun,
    checkYarnVersion,
}