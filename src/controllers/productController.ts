import { getRepository } from "typeorm";
import { Product } from '../entity/Product';
import { HiiperService } from "../services/HiiperService"
import {getMongoRepository} from "typeorm";

class ProductController {
  
  static saveProducts = async () => {
    const productRepository = getMongoRepository(Product);
    const hiiperService = new HiiperService();
    hiiperService.RequestProductsAsync().then(function (value) {
      //console.log(value[0]);
     productRepository.insertMany(value[0]);
    });
  };
};

export default ProductController;