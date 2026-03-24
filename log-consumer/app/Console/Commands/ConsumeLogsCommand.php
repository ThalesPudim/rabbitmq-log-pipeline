<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use App\Models\Log;
use App\Events\LogReceived;

class ConsumeLogsCommand extends Command
{
    protected $signature = 'logs:consume';
    protected $description = 'Consome mensagens da fila de logs do RabbitMQ';

    public function handle()
    {
        $this->info('Aguardando mensagens na fila logs...');

        $connection = new AMQPStreamConnection(
            env('RABBITMQ_HOST', '127.0.0.1'),
            env('RABBITMQ_PORT', 5672),
            env('RABBITMQ_USER', 'guest'),
            env('RABBITMQ_PASSWORD', 'guest'),
        );

        $channel = $connection->channel();

        $channel->queue_declare('logs', false, true, false, false);

        $channel->basic_consume(
            'logs',
            '',
            false,
            false,
            false,
            false,
            function ($msg) {
                $data = json_decode($msg->body, true);

                Log::create([
                    'service'   => $data['service'],
                    'level'     => $data['level'],
                    'message'   => $data['message'],
                    'logged_at' => $data['timestamp'],
                ]);

                broadcast(new LogReceived(
                    $data['service'],
                    $data['level'],
                    $data['message'],
                    $data['timestamp'],
                ));

                $this->info(sprintf(
                    '[%s] [%s] %s: %s',
                    $data['timestamp'],
                    strtoupper($data['level']),
                    $data['service'],
                    $data['message']
                ));

                $msg->ack();
            }
        );

        while ($channel->is_consuming()) {
            $channel->wait();
        }

        $channel->close();
        $connection->close();
    }
}