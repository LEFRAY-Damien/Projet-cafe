<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Commande;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

final class UserSoftDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): mixed {
        // Sécurité : on traite uniquement User
        if (!$data instanceof User) {
            return $data;
        }

        // Sécurité serveur (en plus de celle dans ApiResource)
        $actor = $this->security->getUser();
        $isAdmin = $this->security->isGranted('ROLE_ADMIN');

        if (!$isAdmin && $actor !== $data) {
            throw new AccessDeniedHttpException("Vous ne pouvez supprimer que votre propre compte.");
        }

        // Idempotent : si déjà désactivé/supprimé, on ne refait rien
        if ($data->isSoftDeleted()) {
            return null; // DELETE => 204 No Content
        }

        // 1) Soft delete
        $now = new \DateTimeImmutable();
        $data->setIsActive(false);
        $data->setDeletedAt($now);

        // 2) Supprimer les favoris (propre, sync les 2 côtés)
        $data->clearFavoris();

        // 3) Commandes : annuler uniquement celles NON terminées
        foreach ($data->getCommandes() as $commande) {
            if ($commande instanceof Commande) {
                $commande->annulerSiNonTerminee();
            }
        }

        // 4) Anonymisation des données perso
        // (Tu as mis nom/prenom non-nullable en DB, donc on met une valeur neutre)
        $data->setNom('Anonyme');
        $data->setPrenom('Anonyme');
        $data->setWhatsapp(null);

        // 5) Libération email (unique) : deleted+{id}+{timestamp}@example.invalid
        $id = $data->getId() ?? 0;
        $ts = $now->format('YmdHis');
        $data->setEmail(sprintf('deleted+%d+%s@example.invalid', $id, $ts));

        $this->em->flush();

        // Sur DELETE, retourner null => 204 No Content
        return null;
    }
}
