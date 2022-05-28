import { Box3, BoxGeometry, Group, Mesh, MeshLambertMaterial, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { Plot } from "./plot";
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import { DataConfig } from "../utils/dataconfig";
import { createColors, shuffle } from "./utils";

export class Bar extends Plot {

    hist: { [k: number]: number; };
    labels: any[];
    colors: any;

    chartGroup = new Group()
    dataConfig: DataConfig;
    name: string;
    dataInfo: any;
    
    data: any;

    setupData = (dataConfig : DataConfig) => {
        this.dataConfig = dataConfig
		let rawdata = window.fs.readFileSync(dataConfig.dataJson, "utf-8");
		let data = JSON.parse(rawdata);

		this.name = dataConfig.name
		this.dataInfo = data
		this.data = data["data"]
        this.labels = data["labels"]

    }
    init = (x:number, y:number, z:number) => {
        const fontt = new FontLoader().parse(typefaceFont);
    
        this.chartGroup.layers.enableAll()
        const barSpacing = 2.0

        this.colors = createColors(this.labels.length)
		this.colors = shuffle(this.colors)
        
        for (let index = 0; index < this.labels.length; index++) {
            const element = this.labels[index];
    
            const h = this.data[element] * 0.01;
            const histGeometry = new BoxGeometry(1, 1, 1);
            const object = new Mesh(
                histGeometry,
                new MeshLambertMaterial({
                    color: element != -1 ? this.colors[index] : 0xcacaca,
                })
            );
            
            const barGroup = new Group()
            barGroup.layers.enable(element+2)
    
            object.position.set(barSpacing*index, 0, 0)
    
    
            object.scale.y *= h;
            object.translateY(h / 2);
    
            const tGeo = new TextGeometry(this.data[element].toString(), {
                font: fontt,
                size: 0.8,
                height: 0.5,
            });
    
            const tMat = new MeshLambertMaterial({ color: 0xffffff });
            var tMesh = new Mesh(tGeo, tMat);
    
            let v = new Vector3()
            let b = new Box3().setFromObject(tMesh)
            b.getSize(v)
            let fontW = v.x
            
            tMesh.position.set(barSpacing*index - fontW/2 , 0, 0);
    
            tMesh.translateY(h);
    
            object.layers.set(element + 2);
            tMesh.layers.set(element + 2);
    
            barGroup.add(object)
            barGroup.add(tMesh)
            this.chartGroup.add(barGroup)
    
        }

        this.chartGroup.position.set(x,y,z)
        this.objectToFocus = this.chartGroup
        this.scene.add(this.chartGroup)
    }

    render = () => {
        
    }
}