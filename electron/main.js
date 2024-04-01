const { app, BrowserWindow } = require('electron');
const path = require('path')
const { exec } = require('child_process')

const fs = require('fs');
const logPath = path.join(__dirname, 'logs/flask-output.log');
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

let mainWindow
let flaskProcess = null; // 用于跟踪 Flask 进程

const createWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Excelerate APP",
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'public/favicon2.ico'), // 设置窗口图标的路径
        show: false // 先不显示窗口, 等待最大化后再显示
    });

    console.log(path.join(__dirname, 'public/favicon2.ico'));
    // 取消菜单栏
    mainWindow.setMenu(null);

    // 加载前端构建后的index.html
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'))

    // 'ready-to-show' 事件在页面渲染完成后发出
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize(); // 最大化窗口
        mainWindow.show(); // 然后显示窗口
    });

    // 当窗口关闭时触发的事件
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // 启动flask服务器的可执行文件
    const flaskApp = path.join(__dirname, 'resources/app')

    // 使用 exec 启动 Flask，并且捕获 stdout 和 stderr
    flaskProcess = exec(flaskApp);

    // 将 Flask 输出重定向到日志文件
    flaskProcess.stdout.pipe(logStream);
    flaskProcess.stderr.pipe(logStream);


    flaskProcess.on('close', (code) => {
        // console.log(`Flask process exited with code ${code}`);
        logStream.write(`Flask process exited with code ${code}`);
    });


    // mainWindow.webContents.openDevTools();
}


app.whenReady().then(createWindow)

const kill = require('tree-kill');

app.on('window-all-closed', () => {
    if (flaskProcess !== null) {
        kill(flaskProcess.pid, 'SIGKILL'); // 结束 Flask 进程及其所有子进程
        logStream.end(); // 关闭日志文件流
    }
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (flaskProcess !== null) {
        kill(flaskProcess.pid, 'SIGKILL'); // 同样，在准备退出应用前尝试杀掉 Flask 进程及其所有子进程
    }
});

app.on('quit', () => {
    if (flaskProcess !== null) {
        kill(flaskProcess.pid, 'SIGKILL'); // 在应用退出时尝试杀掉 Flask 进程及其所有子进程
    }
});

// 当应用激活时创建一个新的窗口 (macOS专有)
app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
