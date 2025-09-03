<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractListController;
use Wusong8899\Loan\Api\Serializers\PlatformSerializer;
use Wusong8899\Loan\Models\LoanPlatform;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ListPlatformsController extends AbstractListController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        return LoanPlatform::orderBy('sort_order')->get();
    }
}
