import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

export const TRANSACTION_TOPIC = 'transaction-events';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    const broker = process.env.KAFKA_BROKER || 'localhost:9092';
    this.kafka = new Kafka({
      clientId: 'qashio-api',
      brokers: [broker],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
    } catch (err) {
      console.warn(
        'Kafka connection failed, events will not be emitted:',
        (err as Error)?.message,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
    } catch {
      // ignore
    }
  }

  async emitTransactionEvent(event: 'created' | 'updated', payload: object) {
    try {
      await this.producer.send({
        topic: TRANSACTION_TOPIC,
        messages: [
          {
            value: JSON.stringify({
              event,
              payload,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
    } catch (err) {
      console.warn('Failed to emit Kafka event:', (err as Error)?.message);
    }
  }
}
