<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\CommandeRepository;
use Symfony\Bundle\SecurityBundle\Security;

final class MeCommandesProvider implements ProviderInterface
{
    public function __construct(
        private CommandeRepository $commandeRepository,
        private Security $security,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $user = $this->security->getUser();
        if (!$user) {
            return [];
        }

        // retourne uniquement les commandes de l'utilisateur connecté
        return $this->commandeRepository->findBy(
            ['user' => $user],
            ['dateCommande' => 'DESC']
        );
    }
}
