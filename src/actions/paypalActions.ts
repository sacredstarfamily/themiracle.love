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

export interface PayPalOrderRequest {
    intent: 'CAPTURE' | 'AUTHORIZE';
    purchase_units: Array<{
        reference_id?: string;
        amount: {
            currency_code: string;
            value: string;
            breakdown?: {
                item_total?: {
                    currency_code: string;
                    value: string;
                };
                shipping?: {
                    currency_code: string;
                    value: string;
                };
                tax_total?: {
                    currency_code: string;
                    value: string;
                };
            };
        };
        items?: Array<{
            name: string;
            quantity: string;
            category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
            unit_amount: {
                currency_code: string;
                value: string;
            };
        }>;
        description?: string;
    }>;
    application_context?: {
        brand_name?: string;
        locale?: string;
        landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
        shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
        user_action?: 'CONTINUE' | 'PAY_NOW';
        return_url?: string;
        cancel_url?: string;
    };
}

export interface PayPalProduct {
    id: string;
    name: string;
    description?: string;
    type?: string;
    category?: string;
    image_url?: string;
    home_url?: string;
    [key: string]: unknown;
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
                'username': process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID || '',
                'password': process.env.PAYPAL_CLIENT_SECRET || ''
            };

            try {
                const resp = await axios.post(url,
                    qs.stringify({ 'grant_type': 'client_credentials' }),
                    { headers, auth: Eauth }
                );
                this._token = { ...resp.data, created: new Date().getTime() };

                if (this._token) {
                    this._token.created = new Date().getTime();
                }
            } catch (e) {
                throw new Error(`Failed to get PayPal token: ${e}`);
            }
        }
        return this._token;
    }

    async createOrder(orderRequest: PayPalOrderRequest) {
        const token = await this.getToken();
        const url = API_URL + '/v2/checkout/orders';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
            'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        try {
            const response = await axios.post(url, orderRequest, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal create order error:", error.response?.data);
                throw new Error(`Failed to create PayPal order: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async captureOrder(orderId: string) {
        const token = await this.getToken();
        const url = API_URL + `/v2/checkout/orders/${orderId}/capture`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
        };

        try {
            const response = await axios.post(url, {}, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal capture order error:", error.response?.data);
                throw new Error(`Failed to capture PayPal order: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async getOrder(orderId: string) {
        const token = await this.getToken();
        const url = API_URL + `/v2/checkout/orders/${orderId}`;
        const headers = {
            'Authorization': `Bearer ${token?.access_token}`,
        };

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("PayPal get order error:", error.response?.data);
                throw new Error(`Failed to get PayPal order: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async createItem(itemName: string, itemDescription: string, itemPrice: number, imageUrl: string) {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products'; // Use v1 endpoint, not v2
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        };
        const data = {
            "name": itemName,
            "description": itemDescription,
            "type": "SERVICE",
            "category": "SOFTWARE",
            "image_url": imageUrl,
            "home_url": "https://themiracle.love",
        };

        try {
            console.log("Creating item with data:", data);
            const response = await axios.post(url, data, { headers });
            console.log("Item created successfully:", response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error creating item:", error.response?.data || error.message);
                // Log more details for debugging
                console.error("Status:", error.response?.status);
                console.error("Headers:", error.response?.headers);
                console.error("Request URL:", url);
                console.error("Request Headers:", headers);

                throw new Error(`Failed to create item: ${error.response?.data?.message || error.message}`);
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while creating the item.");
            }
        }
    }
    async getItems() {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products?page_size=20&page=1&total_required=true';
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        try {
            const resp = await axios.get(url, { headers });
            console.log(resp.data)
            return resp.data;
        } catch (e) {
            throw new Error(`Failed to get PayPal items: `);
        }
    }

    async getProduct(id: string) {
        const token = await this.getToken();
        const url = API_URL + '/v1/catalogs/products/' + id;
        const headers = {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'content-type': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`
        }
        try {
            const resp = await axios.get(url, { headers });
            return resp.data;
        } catch (e) {
            console.error(e)
        }
    }

    async deleteProduct(productId: string) {

        // First check if the product exists and get its current data
        let currentProduct: PayPalProduct | undefined;
        try {
            currentProduct = await this.getProduct(productId);
            console.log(`Product ${productId} exists, proceeding with name update.`);
        } catch (getError) {
            if (axios.isAxiosError(getError) && getError.response?.status === 404) {
                console.log(`Product ${productId} not found - cannot update name`);
                throw new Error(`PayPal product not found (404): Product ${productId} does not exist in PayPal catalog`);
            }
            // If it's another error, throw it
            console.error(`Could not verify product existence: ${getError}`);
            throw new Error(`Failed to verify product existence: ${getError}`);
        }

        try {
            // Update the product name to indicate no inventory instead of deleting
            if (!currentProduct) {
                throw new Error(`Product ${productId} could not be loaded for update.`);
            }
            const originalName = currentProduct.name || 'Unnamed Product';
            const updatedName = originalName.includes('| no inventory')
                ? originalName
                : `${originalName} | no inventory`;

            const updateResult = await this.updateProduct(productId, {
                name: updatedName
            });

            console.log('Product marked as no inventory:', productId);
            return updateResult;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const statusCode = error.response?.status;
                const errorMessage = error.response?.data?.message || error.message;

                console.error(`Error updating product (${statusCode}):`, error.response?.data || errorMessage);

                // Provide more specific error messages based on status code
                if (statusCode === 404) {
                    throw new Error(`PayPal product not found (404): Product ${productId} does not exist in PayPal catalog`);
                } else if (statusCode === 403) {
                    throw new Error(`PayPal access forbidden (403): No permission to update product ${productId}`);
                } else if (statusCode === 401) {
                    throw new Error(`PayPal authentication failed (401): Invalid or expired token`);
                } else {
                    throw new Error(`Failed to update product (${statusCode}): ${errorMessage}`);
                }
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while updating the product.");
            }
        }
    }

    async updateProduct(productId: string, updates: {
        name?: string;
        description?: string;
        type?: string;
        category?: string;
        image_url?: string;
        home_url?: string;
    }) {
        const token = await this.getToken();
        const url = API_URL + `/v1/catalogs/products/${productId}`;
        const headers = {
            'Content-Type': 'application/json-patch+json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token?.access_token}`,
        };

        // Create patch operations array
        const patchOperations = Object.entries(updates).map(([key, value]) => ({
            op: 'replace',
            path: `/${key}`,
            value: value
        }));

        try {
            const response = await axios.patch(url, patchOperations, { headers });
            console.log('Product updated successfully:', productId);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating product:", error.response?.data || error.message);
                throw new Error(`Failed to update product: ${error.response?.data?.message || error.message}`);
            } else {
                console.error("Unexpected error:", error);
                throw new Error("An unexpected error occurred while updating the product.");
            }
        }
    }
}
