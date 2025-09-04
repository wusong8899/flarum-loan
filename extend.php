<?php

namespace Wusong8899\Loan;

use Flarum\Extend;
use Flarum\User\User;
use Wusong8899\Loan\Models\LoanApplication;
use Wusong8899\Loan\Api\Controllers;
use Wusong8899\Loan\Api\Serializers;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/loan', 'wusong8899.loan'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    // 将后台设置的 Logo URL 序列化到论坛前端属性 loanLogoUrl
    (new Extend\Settings())
        ->serializeToForum('loanLogoUrl', 'wusong8899-loan.logo_url'),

    (new Extend\Routes('api'))
        // 平台管理
        ->get('/loan-platforms', 'loan.platforms.list', Controllers\ListPlatformsController::class)
        ->post('/loan-platforms', 'loan.platforms.create', Controllers\CreatePlatformController::class)
        ->patch('/loan-platforms/{id}', 'loan.platforms.update', Controllers\UpdatePlatformController::class)
        ->delete('/loan-platforms/{id}', 'loan.platforms.delete', Controllers\DeletePlatformController::class)
        // 移除文件上传端点，改为使用URL

        // 申请管理
        ->get('/loan-applications', 'loan.applications.list', Controllers\ListApplicationsController::class)
        ->post('/loan-applications', 'loan.applications.create', Controllers\CreateApplicationController::class)
        ->patch('/loan-applications/{id}', 'loan.applications.review', Controllers\ReviewApplicationController::class)
        ->delete('/loan-applications/{id}', 'loan.applications.delete', Controllers\DeleteApplicationController::class)

        // 虚拟数据
        ->post('/loan-applications/generate-virtual', 'loan.virtual.generate', Controllers\GenerateVirtualController::class)
        ->get('/loan-virtual-approvals', 'loan.virtual.list', Controllers\ListVirtualApprovalsController::class)
        // 危险操作：清空申请与虚拟审批
        ->delete('/loan-clear', 'loan.clear', Controllers\ClearLoanDataController::class),

    (new Extend\Model(User::class))
        ->hasMany('loanApplications', LoanApplication::class, 'user_id'),
];
