import { Connector } from 'laravel-echo/src/connector/connector';
import {PullerChannel} from "./puller-channel";
import Puller from "../puller";
import {PusherChannel} from "laravel-echo/src/channel";
export class PullerConnector extends Connector {

    puller: any;
    channels: any = {};

    connect(): void {
        if(this.options.puller){
            this.puller = this.options.puller;
        }else{
            if(!this.options.url){
                this.options.url = this.options.host || '';
                if(!this.options.key){
                    this.options.key = 'puller/messages';
                }
                this.options.url += '/'+this.options.key;
            }
            this.puller = new Puller({
                url:this.options.url,
                auth:{
                    endpoint:this.options.authEndpoint,
                    headers:this.options.auth.headers,
                    data:this.options.auth.data||{},
                },
            });
        }
    }
    listen(name: string, event: string, callback: Function): PullerChannel {
        return this.channel(name).listen(event, callback);
    }
    channel(name: string): PullerChannel {
        if (!this.channels[name]) {
            this.channels[name] = new PullerChannel(this.puller, name, this.options);
        }
        return this.channels[name];
    }



    disconnect(): void {
        //Leave all channels
        Object.keys(this.channels).forEach((name: string, index: number) => {
            this.leaveChannel(name);
        });
    }

    leave(name: string): void {
        let channels = [name, 'private-' + name];

        channels.forEach((name: string, index: number) => {
            this.leaveChannel(name);
        });
    }
    /**
     * Leave the given channel.
     */
    leaveChannel(name: string): void {
        if (this.channels[name]) {
            this.channels[name].unsubscribe();

            delete this.channels[name];
        }
    }


    privateChannel(name: string): PullerChannel {
        return this.channel('private-' + name);
    }
    socketId(): string {
        return "";
    }

    presenceChannel(channel: string): any {
        console.error('Presence channels are not supported by Puller.');

    }

}
