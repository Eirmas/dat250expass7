import amqp, { Channel, Connection } from "amqplib";

let channel: Channel, connection: Connection;

const queue = "work_queues";

const doWork = async (message: string) => {
  for (let char of message) {
    if (char === ".") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

const deliverCallback = async (payload: amqp.ConsumeMessage | null) => {
  const message = payload?.content.toString() ?? "";

  try {
    await doWork(message);
  } catch (err) {
    console.log(" [x] Error: %s", err);
  } finally {
    console.log(" [x] Done");
  }
};

const send = (message: string) => {
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(" [x] Sent '%s'", message);
};

(async () => {
  try {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    channel.prefetch(1);

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.consume(queue, deliverCallback, { noAck: true });

    send("First message...");
    send("Second message...");
    send("Third message...");
    send("Fourth message...");
    send("Fifth message...");
  } catch (err) {
    console.warn(err);
  }
})();
