import {
    BufferAttribute,
    BufferGeometry, Color, DoubleSide, Group,
    Material, Mesh, MeshBasicMaterial, NormalBlending, Points, PointsMaterial,
    ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, Texture,
    Vector3
} from "three"
import gsap from "gsap"

import earthVertex from "./shaders/earth/vertex.vs";
import earthFragment from "./shaders/earth/fragment.fs";
import earthApertureFs from "./shaders/earth/aperture.fs"
import earthApertureVs from "./shaders/earth/aperture.vs"
import { createAnimateLine, getCirclePoints } from "./utils/common";
import { flyArc } from "./utils/arc";
import { createLightPillar, createPointMesh, createWaveMesh } from "./utils/mesh";

export type punctuation = {
    circleColor: number,
    lightColumn: {
        startColor: number,
        endColor: number
    }
}


type options = {
    data: {
        startArray: {
            name: string,
            E: number, // 经度
            N: number, // 维度
        },
        endArray: {
            name: string,
            E: number, // 经度
            N: number, // 维度
        }[]
    }[]
    dom: HTMLElement,
    textures: Record<string, Texture>, // 贴图
    earth: {
        radius: number, // 地球半径
        rotateSpeed: number, // 地球旋转速度
        isRotation: boolean // 地球组是否自转
    }
    satellite: {
        show: boolean, // 是否显示卫星
        rotateSpeed: number, // 旋转速度
        size: number, // 卫星大小
        number: number, // 一个圆环几个球
    },
    punctuation: punctuation,
    flyLine: {
        color: number, // 飞线的颜色
        speed: number, // 飞机拖尾线速度
        flyLineColor: number // 飞行线的颜色
    },
}
type uniforms = {
    glowColor: { value: Color; }
    scale: { type: string; value: number; }
    bias: { type: string; value: number; }
    power: { type: string; value: number; }
    time: { type: string; value: any; }
    isHover: { value: boolean; };
    map: { value: Texture | null }
}



export default class Earth {

    public group: Group;
    public earthGroup: Group;

    public around!: BufferGeometry
    public aroundPoints!: Points<BufferGeometry, PointsMaterial>;

    public options: options;
    public uniforms: uniforms
    public timeValue: number;

    public earth!: Mesh<SphereGeometry, ShaderMaterial>; // SphereBufferGeometry
    public punctuationMaterial!: MeshBasicMaterial;
    public markupPointGroup: Group;
    public waveMeshArr: Mesh[];

    public circleLineList: any[];
    public circleList: any[];
    public x: number;
    public n: number;
    public isRotation: boolean;
    public flyLineArcGroup!: Group;

    constructor(options: options) {

        this.options = options;

        this.group = new Group()
        this.group.name = "group";
        this.group.scale.set(0, 0, 0)
        this.earthGroup = new Group()
        this.group.add(this.earthGroup)
        this.earthGroup.name = "EarthGroup";

        // 标注点效果
        this.markupPointGroup = new Group()
        this.markupPointGroup.name = "markupPoint"
        this.waveMeshArr = []

        // 卫星和标签
        this.circleLineList = []
        this.circleList = [];
        this.x = 0;
        this.n = 0;

        // 地球自转
        this.isRotation = this.options.earth.isRotation

        // 扫光动画 shader
        this.timeValue = 100
        this.uniforms = {
            glowColor: {
                value: new Color(0x0cd1eb),
            },
            scale: {
                type: "f",
                value: -1.0,
            },
            bias: {
                type: "f",
                value: 1.0,
            },
            power: {
                type: "f",
                value: 3.3,
            },
            time: {
                type: "f",
                value: this.timeValue,
            },
            isHover: {
                value: false,
            },
            map: {
                value: null,
            },
        };

    }
    async init(): Promise<void> {
        return new Promise(async (resolve) => {

            this.createEarth(); // 创建地球
            this.createStars(); // 添加星星
            this.createEarthGlow() // 创建地球辉光
            // this.createEarthAperture() //TODO: 创建地球的大气层
            await this.createMarkupPoint() // 创建柱状点位
            // await this.createSpriteLabel() // 创建标签
            this.createAnimateCircle() // 创建环绕卫星
            this.createFlyLine() // 创建飞线

            this.show()
            resolve()
        })
    }

    createEarth() {
        const earth_geometry = new SphereGeometry(
            this.options.earth.radius,
            50,
            50
        );

        const earth_border = new SphereGeometry(
            this.options.earth.radius + 10,
            60,
            60
        );

        const pointMaterial = new PointsMaterial({
            color: 0x81ffff, //设置颜色，默认 0xFFFFFF
            transparent: true,
            sizeAttenuation: true,
            opacity: 0.1,
            vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
            size: 0.01, //定义粒子的大小。默认为1.0
        })
        const points = new Points(earth_border, pointMaterial); //将模型添加到场景


        this.earthGroup.add(points);

        this.uniforms.map.value = this.options.textures.earth;
        const earth_material = new ShaderMaterial({
            // wireframe:true, // 显示模型线条
            uniforms: this.uniforms,
            vertexShader: earthVertex,
            fragmentShader: earthFragment,
        });

        earth_material.needsUpdate = true;
        this.earth = new Mesh(earth_geometry, earth_material);
        this.earth.name = "earth";
        this.earthGroup.add(this.earth);
    }


    createStars() {

        const vertices = []
        const colors = []
        for (let i = 0; i < 500; i++) {
            const vertex = new Vector3();
            vertex.x = 800 * Math.random() - 300;
            vertex.y = 800 * Math.random() - 300;
            vertex.z = 800 * Math.random() - 300;
            vertices.push(vertex.x, vertex.y, vertex.z);
            const color = new Color(1, 1, 1)
            colors.push(color.r, color.g, color.b);

        }

        // 星空效果
        this.around = new BufferGeometry()
        this.around.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
        this.around.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));

        const aroundMaterial = new PointsMaterial({
            size: 2,
            sizeAttenuation: true, // 尺寸衰减
            color: 0x4d76cf,
            transparent: true,
            opacity: 1,
            map: this.options.textures.gradient,
        });

        this.aroundPoints = new Points(this.around, aroundMaterial);
        this.aroundPoints.name = "starSky";
        this.aroundPoints.scale.set(1, 1, 1);
        this.group.add(this.aroundPoints);
    }

    createEarthGlow() {
        const R = this.options.earth.radius; //地球半径

        // TextureLoader创建一个纹理加载器对象，可以加载图片作为纹理贴图
        const texture = this.options.textures.glow; // 加载纹理贴图

        // 创建精灵材质对象SpriteMaterial
        const spriteMaterial = new SpriteMaterial({
            map: texture, // 设置精灵纹理贴图
            transparent: true, //开启透明
            opacity: 0.7, // 可以通过透明度整体调节光圈
            depthWrite: true, //禁止写入深度缓冲区数据
        });

        // 创建表示地球光圈的精灵模型
        const sprite = new Sprite(spriteMaterial);
        const ratio = 3
        sprite.scale.set(R * ratio, R * ratio, 1); //适当缩放精灵
        this.earthGroup.add(sprite);
    }

    createEarthAperture() {
        const vertexShader = earthApertureVs
        const fragmentShader = earthApertureFs
        const aeroShader = {
            uniforms: {
                coeficient: {
                    type: "f",
                    value: 1.0,
                },
                power: {
                    type: "f",
                    value: 3,
                },
                glowColor: {
                    type: "c",
                    value: new Color(0x4390d1),
                },
            },
            vertexShader: vertexShader,
            fragmentShader,

        }
        const material = new ShaderMaterial({
            uniforms: aeroShader.uniforms,
            vertexShader: aeroShader.vertexShader,
            fragmentShader: aeroShader.fragmentShader,
            blending: NormalBlending,
            transparent: true,
            depthWrite: false,
        });

        const sphere = new SphereGeometry(
            this.options.earth.radius + 0,
            50,
            50
        );
        const mesh = new Mesh(sphere, material);
        this.earthGroup.add(mesh);
    }

    /*
    async createSpriteLabel() {
        await Promise.all(this.options.data.map(async item => {
          let cityArry = [];
          cityArry.push(item.startArray);
          cityArry = cityArry.concat(...item.endArray);
          await Promise.all(cityArry.map(async e => {
            const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N);
            const div = `<div class="fire-div">${e.name}</div>`;
            const shareContent = document.getElementById("html2canvas");
            shareContent.innerHTML = div;
            const opts = {
              backgroundColor: null, // 背景透明
              scale: 6,
              dpi: window.devicePixelRatio,
            };
            const canvas = await html2canvas(document.getElementById("html2canvas"), opts)
            const dataURL = canvas.toDataURL("image/png");
            const map = new TextureLoader().load(dataURL);
            const material = new SpriteMaterial({
              map: map,
              transparent: true,
            });
            const sprite = new Sprite(material);
            const len = 5 + (e.name.length - 2) * 2;
            sprite.scale.set(len, 3, 1);
            sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
            this.earth.add(sprite);
          }))
        }))
      }
    
*/
    async createMarkupPoint() {

        await Promise.all(this.options.data.map(async (item) => {

            const radius = this.options.earth.radius;
            const lon = item.startArray.E; //经度
            const lat = item.startArray.N; //纬度

            this.punctuationMaterial = new MeshBasicMaterial({
                color: this.options.punctuation.circleColor,
                map: this.options.textures.label,
                transparent: true, //使用背景透明的png贴图，注意开启透明计算
                depthWrite: false, //禁止写入深度缓冲区数据
            });

            const mesh = createPointMesh({
                radius, lon, lat, material:
                    this.punctuationMaterial
            }); //光柱底座矩形平面
            this.markupPointGroup.add(mesh);
            const LightPillar = createLightPillar({
                radius: this.options.earth.radius,
                lon,
                lat,
                index: 0,
                textures: this.options.textures,
                punctuation: this.options.punctuation,
            }); //光柱
            this.markupPointGroup.add(LightPillar);
            const WaveMesh = createWaveMesh({
                radius, lon, lat,
                textures: this.options.textures
            }); //波动光圈
            this.markupPointGroup.add(WaveMesh);
            this.waveMeshArr.push(WaveMesh);

            await Promise.all(item.endArray.map((obj) => {
                const lon = obj.E; //经度
                const lat = obj.N; //纬度
                const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial }); //光柱底座矩形平面
                this.markupPointGroup.add(mesh);
                const LightPillar = createLightPillar({
                    radius: this.options.earth.radius,
                    lon,
                    lat,
                    index: 1,
                    textures: this.options.textures,
                    punctuation: this.options.punctuation
                }); //光柱
                this.markupPointGroup.add(LightPillar);
                const WaveMesh = createWaveMesh({
                    radius, lon, lat,
                    textures: this.options.textures
                }); //波动光圈
                this.markupPointGroup.add(WaveMesh);
                this.waveMeshArr.push(WaveMesh);
            }))
            this.earthGroup.add(this.markupPointGroup)
        }))
    }

    createAnimateCircle() {
        const list = getCirclePoints({
            radius: this.options.earth.radius + 15,
            number: 150, //切割数
            closed: true, // 闭合
        });

        const mat = new MeshBasicMaterial({
            color: "#0c3172",
            transparent: true,
            opacity: 0.4,
            side: DoubleSide,
        });
        const line = createAnimateLine({
            pointList: list,
            material: mat,
            number: 100,
            radius: 0.1,
        });

        this.earthGroup.add(line);

        // 在clone两条线出来
        const l2 = line.clone();
        l2.scale.set(1.2, 1.2, 1.2);
        l2.rotateZ(Math.PI / 6);
        this.earthGroup.add(l2);

        const l3 = line.clone();
        l3.scale.set(0.8, 0.8, 0.8);
        l3.rotateZ(-Math.PI / 6);
        this.earthGroup.add(l3);

        /**
         * 旋转的球
         */
        const ball = new Mesh(
            new SphereGeometry(this.options.satellite.size, 32, 32),
            new MeshBasicMaterial({
                color: "#e0b187", // 745F4D
            })
        );

        const ball2 = new Mesh(
            new SphereGeometry(this.options.satellite.size, 32, 32),
            new MeshBasicMaterial({
                color: "#628fbb", // 324A62
            })
        );

        const ball3 = new Mesh(
            new SphereGeometry(this.options.satellite.size, 32, 32),
            new MeshBasicMaterial({
                color: "#806bdf", //6D5AC4
            })
        );

        this.circleLineList.push(line, l2, l3);
        ball.name = ball2.name = ball3.name = "卫星";


        for (let i = 0; i < this.options.satellite.number; i++) {
            const ball01 = ball.clone();
            // 一根线上总共有几个球，根据数量平均分布一下
            const num = Math.floor(list.length / this.options.satellite.number)
            ball01.position.set(
                list[num * (i + 1)][0] * 1,
                list[num * (i + 1)][1] * 1,
                list[num * (i + 1)][2] * 1
            );
            line.add(ball01);

            const ball02 = ball2.clone();
            const num02 = Math.floor(list.length / this.options.satellite.number)
            ball02.position.set(
                list[num02 * (i + 1)][0] * 1,
                list[num02 * (i + 1)][1] * 1,
                list[num02 * (i + 1)][2] * 1
            );
            l2.add(ball02);

            const ball03 = ball2.clone();
            const num03 = Math.floor(list.length / this.options.satellite.number)
            ball03.position.set(
                list[num03 * (i + 1)][0] * 1,
                list[num03 * (i + 1)][1] * 1,
                list[num03 * (i + 1)][2] * 1
            );
            l3.add(ball03);
        }
    }

    createFlyLine() {

        this.flyLineArcGroup = new Group();
        this.flyLineArcGroup.userData['flyLineArray'] = []
        this.earthGroup.add(this.flyLineArcGroup)

        this.options.data.forEach((cities) => {
            cities.endArray.forEach(item => {

                // 调用函数flyArc绘制球面上任意两点之间飞线圆弧轨迹
                const arcline = flyArc(
                    this.options.earth.radius,
                    cities.startArray.E,
                    cities.startArray.N,
                    item.E,
                    item.N,
                    this.options.flyLine
                );

                this.flyLineArcGroup.add(arcline); // 飞线插入flyArcGroup中
                this.flyLineArcGroup.userData['flyLineArray'].push(arcline.userData['flyLine'])
            });

        })
    }

    show() {
        gsap.to(this.group.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 2,
            ease: "Quadratic",
        })
    }


    render() {

        this.flyLineArcGroup?.userData['flyLineArray']?.forEach((fly:
            { rotation: { z: number; }; flyEndAngle: number; }) => {
            fly.rotation.z += this.options.flyLine.speed; // 调节飞线速度
            if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0;
        })

        if (this.isRotation) {
            this.earthGroup.rotation.y += this.options.earth.rotateSpeed;
        }


        this.circleLineList.forEach((e) => {
            e.rotateY(this.options.satellite.rotateSpeed);
        });


        this.uniforms.time.value =
            this.uniforms.time.value < -this.timeValue
                ? this.timeValue
                : this.uniforms.time.value - 1;

        if (this.waveMeshArr.length) {
            this.waveMeshArr.forEach((mesh: Mesh) => {
                mesh.userData['scale'] += 0.007;
                mesh.scale.set(
                    mesh.userData['size'] * mesh.userData['scale'],
                    mesh.userData['size'] * mesh.userData['scale'],
                    mesh.userData['size'] * mesh.userData['scale']
                );
                if (mesh.userData['scale'] <= 1.5) {
                    (mesh.material as Material).opacity = (mesh.userData['scale'] - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
                } else if (mesh.userData['scale'] > 1.5 && mesh.userData['scale'] <= 2) {
                    (mesh.material as Material).opacity = 1 - (mesh.userData['scale'] - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
                } else {
                    mesh.userData['scale'] = 1;
                }
            });
        }
    }
}