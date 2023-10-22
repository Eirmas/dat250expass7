import amqp, { Channel, Connection } from "amqplib";

let channel: Channel, connection: Connection;

const queue = "hello";
const message = "Hello World!";

(async () => {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue(queue);

    channel.consume(queue, (payload) => {
      if (payload) {
        console.log(" [x] Received %s", payload.content.toString());
      }
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(" [x] Sent '%s'", message);
  } catch (err) {
    console.warn(err);
  }
})();
