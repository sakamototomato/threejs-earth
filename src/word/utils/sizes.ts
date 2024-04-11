import { IWorld } from "../world"
import { EventEmitter } from 'events';


export interface IEvents {
    resize: () => void
}

export default class Sizes {
    public width!: number
    public height!: number
    public viewport!: {
        width: number,
        height: number
    }
    public $sizeViewport!: HTMLElement
    public emitter: EventEmitter;

    constructor(options: IWorld) {
        this.emitter = new EventEmitter();

        // Viewport size
        this.$sizeViewport = options.dom
        this.viewport = {
            width: 0,
            height: 0
        }

        // Resize event
        this.resize = this.resize.bind(this)
        window.addEventListener('resize', this.resize)
        this.resize()

    }


    $on<T extends keyof IEvents>(event: T, fun: () => void) {
        this.emitter.on(event, () => { fun() })
    }

    resize() {
        this.viewport.width = this.$sizeViewport.offsetWidth
        this.viewport.height = this.$sizeViewport.offsetHeight

        this.emitter.emit('resize')
    }
}