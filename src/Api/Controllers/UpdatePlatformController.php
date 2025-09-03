<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractShowController;
use Wusong8899\Loan\Api\Serializers\PlatformSerializer;
use Wusong8899\Loan\Models\LoanPlatform;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class UpdatePlatformController extends AbstractShowController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $data = Arr::get($request->getParsedBody(), 'data.attributes');

        $platform = LoanPlatform::findOrFail($id);

        if (Arr::has($data, 'name')) {
            $platform->name = (string) Arr::get($data, 'name');
        }

        if (Arr::has($data, 'logoUrl')) {
            $logoUrl = (string) Arr::get($data, 'logoUrl');
            if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
                throw new \InvalidArgumentException('无效的图片链接');
            }
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
            $extension = strtolower(pathinfo(parse_url($logoUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
            if (!in_array($extension, $allowedExtensions, true)) {
                throw new \InvalidArgumentException('链接必须指向图片文件');
            }
            $platform->logo_url = $logoUrl;
        }

        if (Arr::has($data, 'sponsorLinkUrl')) {
            $linkUrl = (string) Arr::get($data, 'sponsorLinkUrl');
            if ($linkUrl && !filter_var($linkUrl, FILTER_VALIDATE_URL)) {
                throw new \InvalidArgumentException('无效的跳转链接');
            }
            $platform->sponsor_link_url = $linkUrl ?: null;
        }

        $platform->save();

        return $platform;
    }
}
