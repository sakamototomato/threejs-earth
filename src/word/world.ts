import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Basic } from "./basic";
import { OrbitControls } from "three/examples/jsm/Addons.js";
interface IWorld {
    dom: HTMLElement
}
export default class World {
    public basic!: Basic;
    public option: IWorld;

    public scene: Scene;
    public camera: PerspectiveCamera;
    public renderer: WebGLRenderer
    public controls: OrbitControls;
    // public sizes: Sizes;
    // public material: ShaderMaterial | MeshBasicMaterial;
    // public resources: Resources;
    // public earth: Earth;

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

        // this.sizes = new Sizes({ dom: option.dom })

        // this.sizes.$on('resize', () => {
        //     this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
        //     this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
        //     this.camera.updateProjectionMatrix()
        // })

        // this.resources = new Resources(async () => {
        //     await this.createEarth()
        //     // 开始渲染
        //     this.render()
        // })
    }

}