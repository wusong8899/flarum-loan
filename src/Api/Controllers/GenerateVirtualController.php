<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractCreateController;
use Wusong8899\Loan\Api\Serializers\VirtualApprovalSerializer;
use Wusong8899\Loan\Models\LoanVirtualApproval;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;
use Faker\Factory as Faker;

class GenerateVirtualController extends AbstractCreateController
{
    public $serializer = VirtualApprovalSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $data = Arr::get($request->getParsedBody(), 'data.attributes');
        $platformId = Arr::get($data, 'platform_id');
        $count = Arr::get($data, 'count', 10);

        $faker = Faker::create('zh_CN');
        $generated = [];

        // 生成更自然的中文昵称与 DiceBear 随机头像
        $adjectives = [
            '可爱',
            '机智',
            '冷静',
            '神秘',
            '勇敢',
            '淡定',
            '敏捷',
            '沉稳',
            '飒爽',
            '清醒',
            '睿智',
            '灿烂',
            '温柔',
            '硬核',
            '浪漫',
            '飘逸',
            '无畏',
            '幸运',
            '飞翔',
            '闪电',
            '星辰',
            '月光',
            '晨曦',
            '热血',
            '清爽',
            '细腻',
            '阳光',
            '清新',
            '大方',
            '安静'
        ];
        $nouns = [
            '小熊',
            '麒麟',
            '饺子',
            '狸猫',
            '柚子',
            '山雀',
            '蜗牛',
            '刺猬',
            '鲸鱼',
            '麋鹿',
            '锦鲤',
            '奶茶',
            '火锅',
            '麻薯',
            '猫咪',
            '花卷',
            '糖葫芦',
            '雪豹',
            '向日葵',
            '糯米团',
            '柠檬',
            '星沙',
            '布丁',
            '雪球',
            '桃子',
            '玉兔',
            '星河',
            '松鼠',
            '海豚',
            '青龙'
        ];
        $styles = ['adventurer', 'micah', 'bottts-neutral', 'notionists-neutral', 'big-ears-neutral'];

        for ($i = 0; $i < $count; $i++) {
            $adj1 = $faker->randomElement($adjectives);
            $adj2 = $faker->boolean(35) ? $faker->randomElement($adjectives) : '';
            // 避免两个相同词叠加
            if ($adj2 === $adj1) {
                $adj2 = '';
            }
            $noun = $faker->randomElement($nouns);
            $suffix = $faker->boolean(45) ? (string) $faker->numberBetween(0, 99) : '';
            $nickname = $adj1 . ($adj2 ? $adj2 : '') . $noun . $suffix;

            $style = $faker->randomElement($styles);
            $seed = $nickname; // 头像基于昵称稳定生成
            $avatarUrl = 'https://api.dicebear.com/7.x/' . $style . '/svg?seed=' . urlencode($seed) . '&radius=50&backgroundType=gradientLinear,solid&size=64';

            $generated[] = LoanVirtualApproval::create([
                'platform_id' => $platformId,
                'fake_username' => $nickname,
                'fake_avatar_url' => $avatarUrl,
                'amount' => rand(18, 88888)
            ]);
        }

        // AbstractCreateController expects a single resource. Return the last created one.
        return end($generated) ?: null;
    }
}
