<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractCreateController;
use Wusong8899\Loan\Api\Serializers\ApplicationSerializer;
use Wusong8899\Loan\Models\LoanApplication;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class CreateApplicationController extends AbstractCreateController
{
    public $serializer = ApplicationSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertRegistered();

        $data = Arr::get($request->getParsedBody(), 'data.attributes');

        // 检查是否已申请过该平台
        $existing = LoanApplication::where('user_id', $actor->id)
            ->where('platform_id', Arr::get($data, 'platform_id'))
            ->first();

        if ($existing) {
            throw new \Exception('您已经申请过该平台');
        }

        return LoanApplication::create([
            'user_id' => $actor->id,
            'platform_id' => Arr::get($data, 'platform_id'),
            'message' => Arr::get($data, 'message'),
            'sponsor_account' => Arr::get($data, 'sponsor_account'),
            'applicant_account' => Arr::get($data, 'applicant_account'),
            'status' => 'pending'
        ]);
    }
}
