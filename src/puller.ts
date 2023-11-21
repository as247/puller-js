import Channel from './channel';
import {PullerConnector} from "./echo/puller-connector";

/**
 * This class is the primary API for interacting with broadcasting.
 */
export default class Puller {
    private _defaultOptions: any = {
        error_delay: 10000,
        url:'/puller/messages',
        auth: {
            endpoint: '/broadcasting/auth',
            headers: {},
            data:{},
        },
    };
    options: any;
    constructor(options: any) {
        this.options = Object.assign({},this._defaultOptions, options);
    }
    channel(channel: string): Channel {
        return new Channel(channel, this.options);
    }
    echo(options: any): PullerConnector {
        options.puller= this;
        return new PullerConnector(options);
    }
    static echoConnect(options: any): PullerConnector {
        return new PullerConnector(options);
    }
}


