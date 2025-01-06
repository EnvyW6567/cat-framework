import {ImageEntity} from "./Image.entity";

export interface ImageRepository extends Repository<ImageEntity>{
    save(image: ImageEntity): Promise<boolean>;
}