<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractCreateController;
use Wusong8899\Loan\Api\Serializers\PlatformSerializer;
use Wusong8899\Loan\Models\LoanPlatform;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class CreatePlatformController extends AbstractCreateController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $data = Arr::get($request->getParsedBody(), 'data.attributes');

        $name = (string) Arr::get($data, 'name');
        $logoUrl = (string) Arr::get($data, 'logoUrl');

        if (!$name) {
            throw new \InvalidArgumentException('平台名称不能为空');
        }

        if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException('无效的图片链接');
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        $extension = strtolower(pathinfo(parse_url($logoUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedExtensions, true)) {
            throw new \InvalidArgumentException('链接必须指向图片文件');
        }

        return LoanPlatform::create([
            'name' => $name,
            'logo_url' => $logoUrl,
            'sort_order' => 0,
        ]);
    }
}
