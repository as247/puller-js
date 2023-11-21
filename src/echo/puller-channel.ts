import {Channel as EchoChannel} from "laravel-echo/src/channel/channel";
import {EventFormatter} from "laravel-echo/src/util";
import Puller from "../puller";
import Channel from "../channel";

export class PullerChannel extends EchoChannel{
    puller: Puller;
    name:string;
    options:any;
    eventFormatter: EventFormatter;
    subscription: Channel;
    constructor(puller: any, name: string, options: any) {
        super();
        this.name = name;
        this.puller = puller;
        this.options = options;
        this.eventFormatter = new EventFormatter(this.options.namespace);
        this.subscribe();
    }

    subscribe(): any {
        this.subscription = this.puller.channel(this.name);
    }
    unsubscribe(): void {
        this.subscription.stop();
    }

    error(callback: Function): PullerChannel {
        this.subscription.catch(callback);
        return this;
    }

    listen(event: string, callback: Function): PullerChannel {
        this.subscription.on(this.eventFormatter.format(event), callback);
        return this;
    }
    listenToAll(callback: Function): PullerChannel {
        this.subscription.on('*', (data:any,event)=>{

            let namespace = this.options.namespace.replace(/\./g, '\\');
            let formattedEvent = event.startsWith(namespace) ? event.substring(namespace.length + 1) : '.' + event;

            callback(formattedEvent,data);

        });
        return this;
    }

    stopListening(event: string, callback?: Function): PullerChannel {
        this.subscription.off(event);
        return this;
    }

    stopListeningToAll(): PullerChannel {
        this.subscription.off('*');
        return this;
    }

    subscribed(callback: Function): PullerChannel {
        this.subscription.started(callback);
        return this;
    }

}
