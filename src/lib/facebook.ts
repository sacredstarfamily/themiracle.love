const FACEBOOK_APP_ID = "683091743530359";
const FACEBOOK_VERSION = "v24.0";

declare global {
    interface Window {
        fbAsyncInit?: () => void;
        FB?: FBStatic;
    }
    interface FBStatic {
        init(config: { appId: string; cookie?: boolean; xfbml?: boolean; version?: string }): void;
        login(callback: (response: FBLoginResponse) => void, options?: { scope?: string }): void;
        api(path: string, params?: { fields?: string }, callback?: (userInfo: FBUserInfo) => void): void;
        getLoginStatus(callback: (response: FBLoginResponse) => void): void;
        logout(callback?: (response: FBLoginResponse) => void): void;
        AppEvents?: { logPageView: () => void };
    }
    interface FBLoginResponse {
        authResponse?: {
            accessToken?: string;
            userID?: string;
            expiresIn?: number;
            signedRequest?: string;
        };
        status?: string;
    }
    interface FBUserInfo {
        id?: string;
        name?: string;
        email?: string;
        [key: string]: unknown;
    }
}

export function loadFacebookSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
        // Facebook SDK requires HTTPS for login
        if (window.location.protocol !== "https:") {
            alert("Facebook login cannot be triggered from non-HTTPS pages. Please use a secure (https://) connection.");
            reject(new Error("Facebook SDK requires HTTPS. See https://developers.facebook.com/docs/facebook-login/security#https for details."));
            return;
        }
        if (window.FB) {
            // Always call init with correct version if FB exists
            window.FB.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: FACEBOOK_VERSION,
            });
            window.FB.AppEvents?.logPageView();
            resolve();
            return;
        }
        if (document.getElementById("facebook-jssdk")) {
            // Wait for FB to be available, then init
            const interval = setInterval(() => {
                if (window.FB) {
                    window.FB.init({
                        appId: FACEBOOK_APP_ID,
                        cookie: true,
                        xfbml: true,
                        version: FACEBOOK_VERSION,
                    });
                    window.FB.AppEvents?.logPageView();
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
            return;
        }
        window.fbAsyncInit = function () {
            window.FB?.init({
                appId: FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: FACEBOOK_VERSION,
            });
            window.FB?.AppEvents?.logPageView();
            resolve();
        };
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        document.body.appendChild(script);
    });
}

export function facebookLogin(scope: string = "email"): Promise<FBLoginResponse> {
    return new Promise((resolve, reject) => {
        // Facebook SDK requires HTTPS for login
        if (window.location.protocol !== "https:") {
            alert("Facebook login cannot be triggered from non-HTTPS pages. Please use a secure (https://) connection.");
            reject(new Error("Facebook SDK requires HTTPS. See https://developers.facebook.com/docs/facebook-login/security#https for details."));
            return;
        }
        if (!window.FB) {
            reject(new Error("Facebook SDK not loaded."));
            return;
        }
        window.FB.login((response: FBLoginResponse) => {
            if (response.authResponse) {
                resolve(response);
            } else {
                reject(new Error("Facebook login failed or cancelled."));
            }
        }, { scope });
    });
}

export function facebookGetUser(fields: string = "name,email"): Promise<FBUserInfo> {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("Facebook SDK not loaded."));
            return;
        }
        window.FB.api("/me", { fields }, (userInfo: FBUserInfo) => {
            if (userInfo && userInfo.id) {
                resolve(userInfo);
            } else {
                reject(new Error("Failed to fetch Facebook user info."));
            }
        });
    });
}

export function facebookGetLoginStatus(): Promise<FBLoginResponse> {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("Facebook SDK not loaded."));
            return;
        }
        window.FB.getLoginStatus((response: FBLoginResponse) => {
            resolve(response);
        });
    });
}

export function facebookLogout(): Promise<FBLoginResponse> {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("Facebook SDK not loaded."));
            return;
        }
        window.FB.logout((response: FBLoginResponse) => {
            resolve(response);
        });
    });
}
