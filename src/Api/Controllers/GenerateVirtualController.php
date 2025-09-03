<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractCreateController;
use Wusong8899\Loan\Models\LoanVirtualApproval;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Faker\Factory as Faker;

class GenerateVirtualController extends AbstractCreateController
{
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $data = Arr::get($request->getParsedBody(), 'data.attributes');
        $platformId = Arr::get($data, 'platform_id');
        $count = Arr::get($data, 'count', 10);

        $faker = Faker::create('zh_CN');
        $generated = [];

        for ($i = 0; $i < $count; $i++) {
            $generated[] = LoanVirtualApproval::create([
                'platform_id' => $platformId,
                'fake_username' => $faker->userName,
                'fake_avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($faker->name),
                'amount' => rand(18, 88888)
            ]);
        }

        return ['message' => "成功生成{$count}条虚拟数据"];
    }
}
