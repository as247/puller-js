import client from "./client";

export default class Channel {

    name: string;
    token: any;
    options: any = {};
    events: any = {};
    onErrors: any = [];
    onStarted: any = [];
    isStarted: boolean = false;
    isStopped: boolean = false;
    isRunning: boolean = false;

    /**
     * Create a new class instance.
     */
    constructor(name: string, options: any) {
        this.name = name;
        this.options= options;
    }
    catch(callback: Function): Channel {
        this.onErrors.push(callback);
        return this;
    }
    started(callback: Function): Channel {
        this.onStarted.push(callback);
        return this;
    }

    /**
     * Listen for an event on the channel instance.
     * @param event
     * @param callback
     */
    on(event: string, callback: Function): Channel {
        this.events = this.events || {};
        this.events[event] = callback;
        this.start();
        return this;
    }

    /**
     * Stop listening for an event on the channel instance.
     * @param event
     */
    off(event: string): Channel {
        if(this.events[event]){
            delete this.events[event];
        }
        return this;
    }

    /**
     * Stop listening for all events on the channel instance.
     */
    offAll(): Channel {
        this.events = {};
        return this;
    }

    start() {
        if (!this.isStarted) {
            this.isStopped = false;
            if(this.isPrivate()){
                this.auth().then((response) => {
                    this.loop();
                }).catch((error) => {

                });
            }else {
                this.loop();
            }
        }
    }
    stop() {
        this.isStopped = true;
        this.isStarted = false;
    }
    auth(){
        //get token from server and return promise
        let authData = Object.assign({},this.options.auth.data, {
            channel_name: this.name,
        });
        return new Promise((resolve, reject) => {
            if(this.isPrivate()) {
                client.post(this.options.auth.endpoint, authData, {
                    headers: this.options.auth.headers,
                }).then((response) => {
                    if (response.token) {
                        this.token = response.token;
                        resolve(response);
                    }
                }).catch((error) => {
                    reject(error);
                })
            }else{
                this.token = null;
                resolve({});
            }
        });
    }
    isPrivate(){
        //check if channel is private by checking prefix 'private'
        return this.name.indexOf('private-') === 0;

    }
    loop(){
        //Start looping
        if(this.isStopped){
            this.isRunning = false;
            return;
        }
        this.isStarted = true;
        let startTimestamp = new Date().getTime();
        client.post(this.options.url, {
            channel: this.name,
            token:this.token,
        }).then((response) => {
            let json = response.json;
            if(json && json.token){
                this.token = json.token;
                if(!this.isRunning){
                    this.isRunning = true;
                    this.callStarted();
                }
                if (json.messages) {
                    json.messages.forEach((message) => {
                        if (this.events[message[0]]) {
                            this.events[message[0]](message[1]);
                        }
                        if(this.events['*']){
                            this.events['*'](message[1], message[0]);
                        }
                    });
                }
                this.loop();
            }else{
                this.callErrors(response);
                setTimeout(() => {
                        this.retry(response);
                    },
                    Math.max(0,(this.options.error_delay || 10000) - (new Date().getTime() - startTimestamp))
                );
            }
        }  ).catch((error) => {
            this.callErrors(error);
            setTimeout(() => {
                this.retry(error);
            }, Math.max(0,(this.options.error_delay || 10000) - (new Date().getTime() - startTimestamp)));

        })
    }
    private retry(response){
        if(response.status===401){//Unauthorized
            this.auth().then((response) => {
                this.loop();
            }).catch((error) => {
                this.callErrors(error);
                setTimeout(() => {
                    this.retry(error);
                }, Math.max(0,(this.options.error_delay || 10000)));
            });
        }
    }
    callErrors(error: any){
        this.onErrors.forEach((callback) => {
            callback(error);
        });
    }
    callStarted(){
        this.onStarted.forEach((callback) => {
            callback();
        });
    }
}
