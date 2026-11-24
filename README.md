# 空气古筝 · Air Guzheng

虚空拨弦——在手机上用触屏、智能戒指与智能手杖演奏古筝音色。

## 打开方式（浏览器）

直接打开项目根目录的 `index.html`，或用本地静态服务：

```bash
cd /Users/skat/Projects/active/air-guzheng
npx --yes serve .
# 或: python3 -m http.server 8080
```

手机浏览器访问该地址；iOS 需在「启奏」时允许方向/运动传感器权限。

## Android APK（Capacitor）

需要 **JDK 17 或 21**（本机若只有 Java 24，请用 Android Studio 自带的 JDK，或安装 Temurin 17）。Gradle Wrapper 已升至 8.14.2 以兼容较新 JDK。

```bash
cd /Users/skat/Projects/active/air-guzheng
npm install
npm run build          # 复制 index.html → www/ 与 android assets
npx cap sync android   # 若尚未添加平台: npx cap add android
cd android && ./gradlew assembleDebug
```

Debug APK 路径：

`android/app/build/outputs/apk/debug/app-debug.apk`

用 Android Studio 打开（推荐，可自动选用合适 JDK）：

```bash
npx cap open android
```

更新 HTML 后务必再跑一次 `npm run build`（或 `npm run sync`），再重新打包。

## 控制说明

| 输入 | 操作 |
|------|------|
| **触屏** | 点按或滑过琴弦发声；多指可同时拨弦 |
| **键盘**（桌面） | ↑↓ 选弦，空格/Enter 拨弦 |
| **智能戒指** | 左右倾斜选弦；上倾或甩动（shake）拨弦 |
| **智能手杖** | 轻敲（accel spike）拨当前弦；左右摆动换弦 |
| **手表 UI** | 窄屏（≤280px 宽或 ≤300px 高）自动缩小字体与布局 |

## 音色与调弦

- Web Audio：噪声激励 + 延迟反馈（Karplus-Strong 风格）+ 谐波分音
- 21 弦，D 大调五声（宫商角徵羽），约 D3–D7
- 无需外部音频资源

## 项目结构

```
air-guzheng/
  index.html       # 可玩核心（单文件）
  www/index.html   # Capacitor webDir
  android/         # Capacitor Android 工程
  package.json
  capacitor.config.json
  scripts/build-web.js
  README.md
```

## 智能硬件约定

与仓库 AGENTS.md / 兄弟项目（whistle-runner、whistle-platformer）一致：

- Ring：`DeviceOrientationEvent`，tilt > 5° 定向，shake > 20° 确认，节流约 8 帧
- Cane：`DeviceMotionEvent`，accel spike > 8 = 轻敲，swing > 3 = 方向，节流约 6 帧
- Watch：`@media (max-width: 280px), (max-height: 300px)`
