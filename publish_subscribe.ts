import amqp, { Channel, Connection } from "amqplib";

let channel: Channel, connection: Connection;

const exchange = "publish_subscribe";

(async () => {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    const q = await channel.assertQueue("", { exclusive: true });

    channel.bindQueue(q.queue, exchange, "");

    channel.consume(
      q.queue,
      (payload) => {
        if (payload) {
          console.log(" [x] Received %s", payload.content.toString());
        }
      },
      { noAck: true }
    );

    const msg = process.argv.slice(2).join(" ") || "Hello World!";
    channel.publish(exchange, "", Buffer.from(msg));
    console.log(" [x] Sent '%s'", msg);
  } catch (err) {
    console.warn(err);
  }
})();
