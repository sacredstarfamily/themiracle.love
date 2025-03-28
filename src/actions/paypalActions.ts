import axios from 'axios';
import qs from 'qs';


const Env = process.env.NODE_ENV;

const LIVE_URL = "https://api.paypal.com";

const SANDBOX_API = "https://api-m.sandbox.paypal.com"
let API_URL: string;
if (Env === 'production') {
    API_URL = LIVE_URL
} else {
    API_URL = SANDBOX_API
}
export class PayPalInterface {

    _token: { expires_in: number; created: number; access_token: string } | null = null;
    async getToken() {
        if (!this._token ||
            new Date().getTime() >= this._token.created + this._token.expires_in * 1000) {
            const url = API_URL + '/v1/oauth2/token'
            const headers = {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'content-type': 'application/x-www-form-urlencoded',
            }
            const Eauth = Env === 'development' ? {
                'username': process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_ID || '',
                'password': process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_SECRET || ''
            } : {
                'username': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                'password': process.env.PAYPAL_CLIENT_SECRET || ''
            };

            try {

                const resp = await axios.post(url,
                    //you need this line to format the body in the expected way
                    // for 'application/x-www-form-urlencoded'
                    qs.stringify({ 'grant_type': 'client_credentials' }),
                    { headers, auth: Eauth }
                );
                this._token = { ...resp.data, created: new Date().getTime() };
                console.log(this._token);
                if (this._token) {
                    this._token.created = new Date().getTime();
                }
            } catch (e) {
                throw new Error(`Failed to get PayPal token: `);
            }
        }
        return this._token;
    }
    async createItem(itemName: string, itemDescription: string, itemPrice: number, imageUrl: string) {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products';
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        const data = {
            "name": itemName,
            "description": itemDescription,
            "type": "SERVICE",
            "category": "SOFTWARE",
            "image_url": imageUrl,
            "home_url": "https://themiracle.love",
            "pricing_schemes": [
                {
                    "billing_cycle_sequence": 1,
                    "pricing_scheme": {
                        "fixed_price": {
                            "value": itemPrice,
                            "currency_code": "USD"
                        }
                    }
                }
            ]
        }
        try {
            const resp = await axios.post(url, data, { headers });
            console.log(resp.data);
            return resp.data;
        } catch (e) {

            console.log("error")
        }

    }
    async getItems() {
        const token = await this.getToken();

        const url = API_URL + '/v1/catalogs/products?page_size=12&page=1&total_required=true';
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        try {
            const resp = await axios.get(url, { headers });
            console.log(resp.data);
            console.log(resp.data.products[0].id)
            const tw = await this.getProduct(resp.data.products[0].id)
            console.log(tw)
            return resp.data;
        } catch (e) {
            throw new Error(`Failed to get PayPal items: `);
        }
    }
    async getProduct(id: string) {
        const token = await this.getToken();

        const url = `${API_URL}/v1/catalogs/products/${id}`;
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        try {
            const resp = await axios.get(url, { headers });
            console.log(resp.data);
            return resp.data;
        } catch (e) {
            console.log(e)
        }
    }
}
