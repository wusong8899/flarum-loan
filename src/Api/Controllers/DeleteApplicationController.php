<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractDeleteController;
use Wusong8899\Loan\Models\LoanApplication;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;

class DeleteApplicationController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $id = Arr::get($request->getQueryParams(), 'id');
        $application = LoanApplication::findOrFail($id);
        $application->delete();
    }
}
