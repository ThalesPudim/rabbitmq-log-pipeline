<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LogReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $service;
    public string $level;
    public string $message;
    public string $logged_at;

    public function __construct(string $service, string $level, string $message, string $logged_at)
    {
        $this->service = $service;
        $this->level = $level;
        $this->message = $message;
        $this->logged_at = $logged_at;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('logs'),
        ];
    }
}
