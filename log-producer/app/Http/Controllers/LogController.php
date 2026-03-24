<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class LogController extends Controller
{
  public function publish(Request $request)
  {
    $request->validate([
      'service' => 'required|string',
      'level'   => 'required|in:info,warning,error',
      'message' => 'required|string',
    ]);

    $payload = json_encode([
      'service'   => $request->service,
      'level'     => $request->level,
      'message'   => $request->message,
      'timestamp' => now()->toISOString(),
    ]);

    $connection = new AMQPStreamConnection(
      env('RABBITMQ_HOST', '127.0.0.1'),
      env('RABBITMQ_PORT', 5672),
      env('RABBITMQ_USER', 'guest'),
      env('RABBITMQ_PASSWORD', 'guest'),
    );

    $channel = $connection->channel();

    $channel->queue_declare('logs', false, true, false, false);

    $msg = new AMQPMessage($payload, [ 
      'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT,
    ]);


    $channel->basic_publish($msg, '', 'logs');

    $channel->close();
    $connection->close();

    return response()->json(['status' => 'published']);

  }
}
