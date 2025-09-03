<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::createTable('loan_virtual_approvals', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('platform_id');
    $table->string('fake_username', 50);
    $table->string('fake_avatar_url', 500)->nullable();
    $table->integer('amount');
    $table->timestamps();

    $table->foreign('platform_id')->references('id')->on('loan_platforms')->onDelete('cascade');
});
