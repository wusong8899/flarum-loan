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

        // 校验必填的还款日期，并校验不超过后台配置的最大月数（如果设置）
        $repaymentDate = Arr::get($data, 'repayment_date');
        if (!$repaymentDate) {
            throw new \InvalidArgumentException('还款日期为必填项');
        }
        $maxMonths = (int) (resolve('flarum.settings')->get('wusong8899-loan.repayment_max_months') ?? 0);
        if ($maxMonths > 0) {
            $repaymentTs = strtotime($repaymentDate);
            if ($repaymentTs === false) {
                throw new \InvalidArgumentException('还款日期格式不正确');
            }
            $threshold = (new \DateTimeImmutable(date('Y-m-d', $repaymentTs)))->modify("+{$maxMonths} months");
            $now = new \DateTimeImmutable('now');
            if ($now > $threshold) {
                throw new \InvalidArgumentException('还款日期不得超过后台设置的最长期限');
            }
        }

        return LoanApplication::create([
            'user_id' => $actor->id,
            'platform_id' => Arr::get($data, 'platform_id'),
            'sponsor_account' => Arr::get($data, 'sponsor_account'),
            'repayment_date' => $repaymentDate,
            'status' => 'pending'
        ]);
    }
}
