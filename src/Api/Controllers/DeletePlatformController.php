<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractDeleteController;
use Wusong8899\Loan\Models\LoanPlatform;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class DeletePlatformController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $platform = LoanPlatform::findOrFail($id);
        $platform->delete();
    }
}
