# Excelerate

Excelerate是一个桌面应用程序，旨在为高校行政工作的表格任务发布者和执行者搭建一个沟通桥梁，实现全流程工作自动化。具体而言“规则制定”“数据检验”“文件合并”“文件拆分”四个功能模块。功能演示可见根目录下的视频。

## 开始

这些说明将帮助你在本地机器上获取项目的副本并运行起来，用于开发和测试。请看部署部分了解如何在现场环境中部署项目。

### 前提条件

在开始之前，请确保你的机器已经安装了以下软件：

- Python (推荐使用 [Anaconda](https://www.anaconda.com/distribution/) 管理 Python 版本和环境)
- Node.js (可以从 [Node.js 官网](https://nodejs.org/) 下载安装)

```bash
# 检查 Python 安装
python --version

# 检查 Node.js 安装
node --version
npm --version
```

### 安装

一个逐步的系列示例，告诉你如何运行一个开发环境。

#### 后端 Flask 服务器

1. 克隆项目仓库：

```bash
git clone <repository-url>
```

2. 进入 `backend` 目录：

```bash
cd backend
```

3. 复现conda虚拟环境：

```bash
conda env create -f environment.yml -n your_env_name
conda activate your_env_name
```

4. 运行开发服务器：

```bash
flask run
```

#### 前端 Vue 3 应用

1. 进入 `frontend` 目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
npm install
```

3. 运行开发服务器：

```bash
npm run dev
```

这将在本地启动前端开发服务器，默认在 [http://localhost:8080](http://localhost:8080)。

#### 测试

分别进入前后端的目录，然后运行开发服务器的命令

## 使用到的技术

- [Flask](http://flask.pocoo.org/) - 用于后端API的微框架
- [Vue.js](https://vuejs.org/) - 前端框架，用于构建用户界面
