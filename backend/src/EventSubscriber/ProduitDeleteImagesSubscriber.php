<?php

namespace App\EventSubscriber;

use App\Entity\Produit;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PreRemoveEventArgs;
use Doctrine\ORM\Events;

final class ProduitDeleteImagesSubscriber implements EventSubscriber
{
    public function getSubscribedEvents(): array
    {
        return [Events::preRemove];
    }

    public function preRemove(PreRemoveEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Produit) {
            return;
        }

        /** @var EntityManagerInterface $em */
        $em = $args->getObjectManager();

        // On force la suppression des images liées
        foreach ($entity->getImages() as $img) {
            $em->remove($img); // => déclenche ImageDeleteSubscriber => supprime le fichier
        }

        // IMPORTANT: pas de flush ici (Doctrine gère le flush global)
    }
}
