import { Vector3, CatmullRomCurve3, TubeGeometry, Mesh } from "three";

// 获取点
export const getCirclePoints = (option: {
    number: number; radius: number; closed: boolean;
}) => {
    const list = [];
    for (
        let j = 0;
        j < 2 * Math.PI - 0.1;
        j += (2 * Math.PI) / (option.number || 100)
    ) {
        list.push([
            parseFloat((Math.cos(j) * (option.radius || 10)).toFixed(2)),
            0,
            parseFloat((Math.sin(j) * (option.radius || 10)).toFixed(2)),
        ]);
    }
    if (option.closed) list.push(list[0]);
    return list;
}

/**
 * 创建动态的线
 */
export const createAnimateLine = (option: {
    pointList: number[][];
    number: number; radius: number; radialSegments?: number; material: any;
}) => {
    // 由多个点数组构成的曲线 通常用于道路
    const l: Vector3[] = [];
    option.pointList.forEach((e: number[]) =>
        l.push(new Vector3(e[0], e[1], e[2]))
    );
    const curve = new CatmullRomCurve3(l); // 曲线路径

    // 管道体
    const tubeGeometry = new TubeGeometry(
        curve,
        option.number || 50,
        option.radius || 1,
        option.radialSegments
    );
    return new Mesh(tubeGeometry, option.material);
}





export const lon2xyz = (R: number, longitude: number, latitude: number): Vector3 => {
    let lon = longitude * Math.PI / 180; // 转弧度值
    const lat = latitude * Math.PI / 180; // 转弧度值
    lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度

    // 经纬度坐标转球面坐标计算公式
    const x = R * Math.cos(lat) * Math.cos(lon);
    const y = R * Math.sin(lat);
    const z = R * Math.cos(lat) * Math.sin(lon);
    // 返回球面坐标
    return new Vector3(x, y, z);
}