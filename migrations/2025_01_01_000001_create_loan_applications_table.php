<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::createTable('loan_applications', function (Blueprint $table) {
    $table->increments('id');
    $table->unsignedInteger('user_id');
    $table->unsignedInteger('platform_id');
    $table->text('message');
    $table->integer('approved_amount')->nullable();
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->unsignedInteger('reviewed_by')->nullable();
    $table->timestamp('reviewed_at')->nullable();
    $table->timestamps();

    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('platform_id')->references('id')->on('loan_platforms')->onDelete('cascade');
    $table->unique(['user_id', 'platform_id']); // 确保一个用户只能申请一次
});
