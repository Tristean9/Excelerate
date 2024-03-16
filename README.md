# Excelerate

Accelerating Excel Operations with a modern web interface and a powerful backend.

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

* [Flask](http://flask.pocoo.org/) - 用于后端API的微框架
* [Vue.js](https://vuejs.org/) - 前端框架，用于构建用户界面


## 贡献

如果你想为项目贡献代码，请先阅读 `CONTRIBUTING.md`，了解如何提交 pull requests。如果你发现任何问题，可以提交 issue。

## 版本控制

我们使用 Git 进行版本控制，具体的分支管理和版本策略可以在 `VERSIONING.md` 中找到。

## 作者

* **zth** - *初始工作* - [你的GitHub账号](链接到你的GitHub账号)

## 许可证

这个项目是在 MIT 许可证下授权的 - 查看 `LICENSE` 文件了解详情。

## 鸣谢

* 感谢所有为这个项目做出贡献的人。
* 感谢所有提供反馈和使用本项目的用户。
* 感谢所有提供灵感和前沿技术的开源项目。

