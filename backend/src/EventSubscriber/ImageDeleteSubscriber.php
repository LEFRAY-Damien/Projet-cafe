<?php

namespace App\EventSubscriber;

use App\Entity\Image;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PreRemoveEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsDoctrineListener(event: Events::preRemove)]
final class ImageDeleteSubscriber
{
    public function __construct(
        #[Autowire('%uploads_dir%')]
        private string $uploads_dir
    ) {}

    public function preRemove(PreRemoveEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Image) {
            return;
        }

        $url = $entity->getUrl();
        if (!$url) {
            return;
        }

        // Robust : support URL absolue ou relative
        $pathPart = parse_url($url, PHP_URL_PATH) ?? $url;

        // On supprime uniquement si c'est dans /uploads/
        if (!str_contains($pathPart, '/uploads/')) {
            return;
        }

        $filename = basename($pathPart);
        $path = rtrim($this->uploads_dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;

        if (is_file($path)) {
            @unlink($path);
        }
    }
}
