<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractListController;
use Wusong8899\Loan\Api\Serializers\ApplicationSerializer;
use Wusong8899\Loan\Models\LoanApplication;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListApplicationsController extends AbstractListController
{
    public $serializer = ApplicationSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $approved = ($request->getQueryParams()['approved'] ?? null) === '1';

        // 公共列表：仅返回审核通过的记录
        if ($approved) {
            return LoanApplication::with(['user', 'platform'])
                ->where('status', 'approved')
                ->orderByDesc('created_at')
                ->get();
        }

        // 管理员可见全部，普通用户只能看到自己
        if ($actor->isAdmin()) {
            return LoanApplication::with(['user', 'platform'])->orderByDesc('created_at')->get();
        }

        return LoanApplication::with(['user', 'platform'])
            ->where('user_id', $actor->id)
            ->orderByDesc('created_at')
            ->get();
    }
}
