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
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // 加载前端构建后的index.html
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'))

    // 启动flask服务器的可执行文件
    const flaskApp = path.join(__dirname, 'resources/app')

    // 使用 exec 启动 Flask，并且捕获 stdout 和 stderr
    flaskProcess = exec(flaskApp);

    // 将 Flask 输出重定向到日志文件
    flaskProcess.stdout.pipe(logStream);
    flaskProcess.stderr.pipe(logStream);


    flaskProcess.on('close', (code) => {
        console.log(`Flask process exited with code ${code}`);
        logStream.write(`Flask process exited with code ${code}`);
    });

    // flaskProcess.stdout.on('data', (data) => {
    //     console.log(`Flask stdout: ${data}`);
    // });

    // flaskProcess.stderr.on('data', (data) => {
    //     console.error(`Flask stderr: ${data}`);
    // });
    // flaskProcess.on('close', (code) => {
    //     console.log(`Flask process exited with code ${code}`);
    // });

    mainWindow.webContents.openDevTools();
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
