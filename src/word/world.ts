import { MeshBasicMaterial, PerspectiveCamera, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { Basic } from "./basic";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Sizes from "./utils/sizes";
import { Resources } from "./resources";
import Earth from "./earth";
import citiesData from "./utils/citiesData";
export interface IWorld {
    dom: HTMLElement
}
export default class World {
    public basic: Basic;
    public option: IWorld;

    public scene: Scene;
    public camera: PerspectiveCamera;
    public renderer: WebGLRenderer
    public controls: OrbitControls;
    public sizes: Sizes;
    public material?: ShaderMaterial | MeshBasicMaterial;
    public resources: Resources;
    public earth!: Earth;

    constructor(option: IWorld) {
        /**
         * 加载资源
         */
        this.option = option

        this.basic = new Basic(option.dom)
        this.scene = this.basic.scene
        this.renderer = this.basic.renderer
        this.controls = this.basic.controls
        this.camera = this.basic.camera

        this.sizes = new Sizes({ dom: option.dom })

        this.sizes.$on('resize', () => {
            console.log("on resize")
            this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
            this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
            this.camera.updateProjectionMatrix()
        })

        this.resources = new Resources(async () => {
            await this.createEarth()
            // 开始渲染
            this.render()
        })
    }


    async createEarth() {

        // 资源加载完成，开始制作地球，注释在new Earth()类型里面
        this.earth = new Earth({
            data: citiesData,
            dom: this.option.dom,
            textures: this.resources.textures,
            earth: {
                radius: 50,
                rotateSpeed: 0.002,
                isRotation: true
            },
            satellite: {
                show: true,
                rotateSpeed: -0.01,
                size: 1,
                number: 2
            },
            punctuation: {
                circleColor: 0x3892ff,
                lightColumn: {
                    startColor: 0xe4007f, // 起点颜色
                    endColor: 0xffffff, // 终点颜色
                },
            },
            flyLine: {
                color: 0xf3ae76, // 飞线的颜色
                flyLineColor: 0xff7714, // 飞行线的颜色
                speed: 0.004, // 拖尾飞线的速度
            }
        })

        this.scene.add(this.earth.group)

        await this.earth.init()

        // 隐藏dom
        const loading = document.querySelector('#loading')!
        loading.classList.add('out')

    }


    public render() {
        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)
        this.controls && this.controls.update()
        this.earth && this.earth.render()
    }

}