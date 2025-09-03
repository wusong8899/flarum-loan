<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if ($schema->hasColumn('loan_applications', 'message')) {
            $schema->table('loan_applications', function (Blueprint $table) {
                $table->dropColumn('message');
            });
        }
    },
    'down' => function (Builder $schema) {
        if (!$schema->hasColumn('loan_applications', 'message')) {
            $schema->table('loan_applications', function (Blueprint $table) {
                $table->text('message')->nullable();
            });
        }
    }
];
