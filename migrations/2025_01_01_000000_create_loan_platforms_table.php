<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::createTable('loan_platforms', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name', 100);
    $table->string('logo_url', 500);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
