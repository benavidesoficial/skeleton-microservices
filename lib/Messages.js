import {v4 as uuid} from 'uuid';
import * as NATS from 'nats';
import root from 'app-root-path';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);

export default class Messages {

    constructor() {
        this.skeleton = require(`${root}/skeleton.json`);
        this.nats = NATS.connect(this.skeleton.nats);
    }

    createMessages(message = {}) {
        message.mid = uuid();
        message.timestamp = Date.now();
        if (!message.mid) throw new Error('Not found "mid"');
        if (!message.timestamp) throw new Error('Not found "timestamp"');
        if (!message.from) throw new Error('Not found "from"');
        if (!message.to) throw new Error('Not found "to"');
        if (!message.body) throw new Error('Not found "body"');

        // let message = {
        //   mid: uuid(),
        //   rmid: '', //Options
        //   to: 'microservice:uuid',
        //   forward: '', //Optinal
        //   from: '',
        //   type: '', // optional
        //   priority: '', // optional
        //   timestamp: '',
        //   ttl: '', // Optional
        //   body: {},
        //   authorization: '', // Optional
        //   signature: ''
        // }
        return message;
    }

    send(message, reply) {
        // Primero determinamos si se require de una respuesta
        if (reply) {
            return new Promise((resolve, reject) => {
                // Creamos un casillero
                let inbox = this.nats.createInbox();
                // Nos suscribimos al casillero, recibiremos maximo un mensaje
                this.nats.subscribe(inbox, {
                    max: 1
                }, (msg) => {
                    // Resolvemos la promesa
                    resolve(msg)
                })

                this.nats.publish(message.to, this.createMessages(message), inbox);
            });

        } else {
            // Publicando mensaje en NATS
            this.nats.publish(message.to, this.createMessages(message));
        }
        // Si existe un remitente "rmid", entonces este es quien espera la respuesta

    }

    setConfig(config = {}) {

    }

    inbox(chanel, cb) {
        this.nats.subscribe(chanel, cb);
    }

}
//
// let messages = new Messages({
//   url: 'nats://172.16.203.200:4222',
//   json: true
// });
//
// messages.inbox();
//
// let authMessage = {
//   to: 'auth:login',
//   from: 'gateway:id',
//   body: {
//     username: "miguel",
//     password: "miguel"
//   }
// };
//
// let authVerificationMessage = {
//   to: 'auth:verification',
//   from: 'gateway:id',
//   authorization: 'bjh23b123bh4g1j2i34hi',
//   body: {}
// };
//
// messages.sendMessages(messages.createMessages(authMessage));
// messages.sendMessages(messages.createMessages(authVerificationMessage));
