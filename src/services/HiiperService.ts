const req = require("request");
import config from "../config/config";
import { Length } from 'class-validator';

class HiiperService {
  private email: string;
  private password: string;
  private headers: object;
  private authenticationUri: string;

  constructor() {
    this.email = config.hiiperEmail;
    this.password = config.hiiperPassword;
    this.headers = { "Accept": "application/json, text/plain, */*", "Origin": "https://www.hiiper.nl", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36", "Sec-Fetch-Site": "same-site", "Sec-Fetch-Mode": "cors", "Referer": "https://www.hiiper.nl/login/", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7" };
    this.authenticationUri = "https://api.hiiper.nl/authenticate"
  }

  private SetupSessionAsync(): any {
    //This will store the cookie
    const cookie = req.jar();
    return new Promise((resolve, reject): void => {
      req.post(
        this.authenticationUri,
        {
          jar: cookie,
          json: {
            message: {
              email: this.email,
              password: this.password
            }
          },
          headers: this.headers
        },
        function (error, response): void {
          if (!error && response.statusCode == 200) {
            resolve(cookie)
          }
          else {
            console.log(error);
            reject("Error setting up Hiiper Session")
          }
        }
      );
    });
  }

  private async HiiperRequestAsync(hiperUri: string) {
    const cookie = await this.SetupSessionAsync();
    return new Promise((resolve, reject): void => {
      req.get(hiperUri, { jar: cookie, headers: this.headers }, function (error, response, body) {
        const result = JSON.parse(body)
        resolve(result.items);
      });
    });
  };

  public async RequestProducts() {
    const products = []
    let pageSize = 1;
    let productUri = `https://api.hiiper.nl/api/v1/client/clickout/deals?deals_type=general&items_in_row=11&r_limit=0&rarity=0&rows_per_page=5&page=${pageSize}`
    let retrievedProducts: any = await this.HiiperRequestAsync(productUri);
    products.push(retrievedProducts);
    pageSize++;
    console.log(pageSize)
    // Increase page while there is data
    while (retrievedProducts.length > 0) {
      productUri = `https://api.hiiper.nl/api/v1/client/clickout/deals?deals_type=general&items_in_row=11&r_limit=0&rarity=0&rows_per_page=5&page=${pageSize}`
      console.log(productUri);
      retrievedProducts = await this.HiiperRequest(productUri);
      products.push(retrievedProducts);
      pageSize++;
    }
    return products;
  }

}

const hiiperService = new HiiperService();
hiiperService.RequestProducts();
