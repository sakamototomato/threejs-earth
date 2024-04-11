import { LoadingManager, Texture, TextureLoader } from "three";
import { resources } from "./utils/assets";

export class Resources {
    private manager!: LoadingManager
    private callback: () => void;
    private textureLoader!: InstanceType<typeof TextureLoader>;
    public textures: Record<string, Texture>;
    constructor(callback: () => void) {
        this.callback = callback // 资源加载完成的回调

        this.textures = {} // 贴图对象

        this.setLoadingManager()
        this.loadResources()
    }

    setLoadingManager() {
        this.manager = new LoadingManager()
        // 开始加载
        this.manager.onStart = () => {
            console.log('开始加载资源文件')
        }
        // 加载完成
        this.manager.onLoad = () => {
            console.log("加载完成")
            this.callback()
        }
        // 正在进行中
        this.manager.onProgress = (url) => {
            console.log(`正在加载：${url}`)
        }

        this.manager.onError = url => {
            console.log('加载失败：' + url)
        }
    }

    loadResources() {
        this.textureLoader = new TextureLoader(this.manager)
        resources.textures?.forEach((item) => {
            this.textureLoader.load(item.url, (t) => {
                this.textures[item.name] = t
            })
        })
    }

}
