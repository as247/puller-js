/**
 * Ajax client which try to use fetch api if available, then fallback to XMLHttpRequest.
 */
class Client {

    post(url: string, fields: any, options?: any): Promise<any>{
        return this.request({
            method: 'POST',
            url: url,
            data: fields,
            headers: options ? options.headers: {}
        });
    }

    get(url: string, options: any): Promise<any>{
        return this.request({
            method: 'GET',
            url: url,
            data: null,
            headers: options ? options.headers: {}
        });
    }
    request(options: any): Promise<any>{
        return new Promise((resolve, reject) => {
            //Default headers content type to json
            options.headers = options.headers || {};
            options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
            if(options.headers['Content-Type']==='application/json' && typeof options.data !== 'string'){
                options.data = JSON.stringify(options.data);
            }
            if (typeof fetch === 'function') {
                fetch(options.url, {
                    method: options.method,
                    body: options.data,
                    headers: options.headers
                }).then((response) => {
                    response.text().then((text) => {
                        let json = this.parseJson(text);
                        if(response.ok) {
                            resolve({status:response.status,json});
                        }else{
                            reject({status:response.status,json});
                        }
                    }).catch((error) => {
                        reject({status:response.status,error});
                    });

                }).catch((error) => {
                    reject({error});
                });
            } else {
                let request = new XMLHttpRequest();
                request.open(options.method, options.url, true);
                for (let name in options.headers) {
                    request.setRequestHeader(name, options.headers[name]);
                }
                request.onload = () => {
                    let json = this.parseJson(request.responseText);
                    if (request.status >= 200 && request.status < 400) {
                        resolve(json);
                    } else {
                        reject({status: request.status, json});
                    }
                };
                request.onerror = () => {
                    let json = this.parseJson(request.responseText);
                    reject({
                        status: request.status,
                        json,
                    });
                };
                try {
                    request.send(options.data);
                } catch (error) {
                    reject({error});
                }
            }
        });


    }
    parseJson(response: any): any{
        try {
            return JSON.parse(response);
        } catch (e) {
            return {};
        }
    }



}
//Export instance of Client
const client = new Client();
export default client;
